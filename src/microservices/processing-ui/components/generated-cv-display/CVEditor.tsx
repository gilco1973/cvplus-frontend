/**
 * CV Editor Component
 *
 * Rich text editor for CV content with inline editing,
 * section management, and formatting tools.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Undo,
  Redo,
  Type,
  Palette
} from 'lucide-react';

import type { Job } from '../../types/job';

interface CVEditorProps {
  job: Job;
  content: any;
  onContentUpdate: (content: any) => void;
  className?: string;
}

interface EditableSection {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
  editable: boolean;
}

/**
 * CV Editor Component
 */
export const CVEditor: React.FC<CVEditorProps> = ({
  job,
  content,
  onContentUpdate,
  className = ''
}) => {
  const [sections, setSections] = useState<EditableSection[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false
  });
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize sections from content
  useEffect(() => {
    if (content?.html) {
      const parsedSections = parseHTMLToSections(content.html);
      setSections(parsedSections);
    }
  }, [content?.html]);

  // Parse HTML content into editable sections
  const parseHTMLToSections = (html: string): EditableSection[] => {
    // This is a simplified parser - in a real implementation,
    // you'd use a proper HTML parser
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const sectionElements = tempDiv.querySelectorAll('[data-section]');
    return Array.from(sectionElements).map((element, index) => ({
      id: element.getAttribute('data-section') || `section-${index}`,
      type: element.getAttribute('data-section-type') || 'text',
      title: element.getAttribute('data-section-title') || `Section ${index + 1}`,
      content: element.innerHTML,
      order: index,
      editable: element.getAttribute('data-editable') !== 'false'
    }));
  };

  // Convert sections back to HTML
  const sectionsToHTML = (sections: EditableSection[]): string => {
    return sections
      .sort((a, b) => a.order - b.order)
      .map(section => `
        <div
          data-section="${section.id}"
          data-section-type="${section.type}"
          data-section-title="${section.title}"
          data-editable="${section.editable}"
          class="cv-section"
        >
          ${section.content}
        </div>
      `).join('\n');
  };

  // Handle section content change
  const handleSectionChange = useCallback((sectionId: string, newContent: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, content: newContent }
        : section
    ));

    // Update parent component
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, content: newContent }
        : section
    );

    const newHTML = sectionsToHTML(updatedSections);
    onContentUpdate({ ...content, html: newHTML });
  }, [sections, content, onContentUpdate]);

  // Handle section reordering
  const handleSectionReorder = useCallback((sectionId: string, newOrder: number) => {
    setSections(prev => {
      const updated = prev.map(section => {
        if (section.id === sectionId) {
          return { ...section, order: newOrder };
        }
        // Adjust other sections' order
        if (section.order >= newOrder && section.id !== sectionId) {
          return { ...section, order: section.order + 1 };
        }
        return section;
      });

      // Update parent
      const newHTML = sectionsToHTML(updated);
      onContentUpdate({ ...content, html: newHTML });

      return updated;
    });
  }, [content, onContentUpdate]);

  // Handle section deletion
  const handleSectionDelete = useCallback((sectionId: string) => {
    setSections(prev => {
      const filtered = prev.filter(section => section.id !== sectionId);
      const newHTML = sectionsToHTML(filtered);
      onContentUpdate({ ...content, html: newHTML });
      return filtered;
    });
  }, [content, onContentUpdate]);

  // Add new section
  const handleAddSection = useCallback((type: string = 'text') => {
    const newSection: EditableSection = {
      id: `section-${Date.now()}`,
      type,
      title: 'New Section',
      content: '<p>Click to edit this section...</p>',
      order: sections.length,
      editable: true
    };

    setSections(prev => {
      const updated = [...prev, newSection];
      const newHTML = sectionsToHTML(updated);
      onContentUpdate({ ...content, html: newHTML });
      return updated;
    });

    // Focus the new section
    setActiveSection(newSection.id);
  }, [sections.length, content, onContentUpdate]);

  // Format text
  const formatText = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);

    // Update format state
    setFormatState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline')
    });
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();

    if (!draggedSection || draggedSection === targetSectionId) return;

    const targetSection = sections.find(s => s.id === targetSectionId);
    if (targetSection) {
      handleSectionReorder(draggedSection, targetSection.order);
    }

    setDraggedSection(null);
  }, [draggedSection, sections, handleSectionReorder]);

  // Toolbar component
  const EditorToolbar = () => (
    <div className="flex items-center space-x-2 p-3 bg-gray-700 border-b border-gray-600">
      {/* Text formatting */}
      <div className="flex items-center space-x-1 border-r border-gray-600 pr-3">
        <button
          onClick={() => formatText('bold')}
          className={`p-2 rounded hover:bg-gray-600 ${
            formatState.bold ? 'bg-cyan-600 text-white' : 'text-gray-300'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('italic')}
          className={`p-2 rounded hover:bg-gray-600 ${
            formatState.italic ? 'bg-cyan-600 text-white' : 'text-gray-300'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('underline')}
          className={`p-2 rounded hover:bg-gray-600 ${
            formatState.underline ? 'bg-cyan-600 text-white' : 'text-gray-300'
          }`}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center space-x-1 border-r border-gray-600 pr-3">
        <button
          onClick={() => formatText('insertUnorderedList')}
          className="p-2 rounded hover:bg-gray-600 text-gray-300"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('insertOrderedList')}
          className="p-2 rounded hover:bg-gray-600 text-gray-300"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex items-center space-x-1 border-r border-gray-600 pr-3">
        <button
          onClick={() => formatText('justifyLeft')}
          className="p-2 rounded hover:bg-gray-600 text-gray-300"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('justifyCenter')}
          className="p-2 rounded hover:bg-gray-600 text-gray-300"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('justifyRight')}
          className="p-2 rounded hover:bg-gray-600 text-gray-300"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      {/* History */}
      <div className="flex items-center space-x-1 border-r border-gray-600 pr-3">
        <button
          onClick={() => formatText('undo')}
          className="p-2 rounded hover:bg-gray-600 text-gray-300"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('redo')}
          className="p-2 rounded hover:bg-gray-600 text-gray-300"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Add section */}
      <button
        onClick={() => handleAddSection()}
        className="flex items-center space-x-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Add Section</span>
      </button>
    </div>
  );

  return (
    <div className={`cv-editor bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      <EditorToolbar />

      <div className="cv-editor-content" ref={editorRef}>
        {sections.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Type className="w-12 h-12 mx-auto mb-4" />
            <p className="mb-4">No editable sections found</p>
            <button
              onClick={() => handleAddSection()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
            >
              Add First Section
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {sections
              .sort((a, b) => a.order - b.order)
              .map(section => (
                <div
                  key={section.id}
                  className={`
                    cv-editor-section group relative border rounded-lg transition-all
                    ${activeSection === section.id
                      ? 'border-cyan-500 bg-gray-700/50'
                      : 'border-gray-600 bg-gray-800/30'
                    }
                    ${draggedSection === section.id ? 'opacity-50' : ''}
                  `}
                  draggable
                  onDragStart={(e) => handleDragStart(e, section.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, section.id)}
                >
                  {/* Section header */}
                  <div className="flex items-center justify-between p-3 border-b border-gray-600">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <span className="text-sm font-medium text-gray-200">
                        {section.title}
                      </span>
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-700 rounded">
                        {section.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleSectionDelete(section.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded"
                        title="Delete section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Section content */}
                  <div
                    className="p-4 bg-white text-gray-900 min-h-[100px] focus:outline-none"
                    contentEditable={section.editable}
                    suppressContentEditableWarning
                    dangerouslySetInnerHTML={{ __html: section.content }}
                    onFocus={() => setActiveSection(section.id)}
                    onBlur={(e) => {
                      handleSectionChange(section.id, e.currentTarget.innerHTML);
                      setActiveSection(null);
                    }}
                    onKeyUp={() => {
                      setFormatState({
                        bold: document.queryCommandState('bold'),
                        italic: document.queryCommandState('italic'),
                        underline: document.queryCommandState('underline')
                      });
                    }}
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      lineHeight: '1.6'
                    }}
                  />
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Editor status */}
      <div className="flex items-center justify-between p-3 border-t border-gray-700 bg-gray-800/50 text-sm text-gray-400">
        <div>
          {sections.length} section{sections.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Auto-save enabled</span>
        </div>
      </div>
    </div>
  );
};