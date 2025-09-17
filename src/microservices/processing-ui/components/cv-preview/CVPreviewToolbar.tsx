import React from 'react';
import { Edit3, Save, X, Eye, EyeOff } from 'lucide-react';
import type { CVPreviewToolbarProps } from '../../types/cv-preview';

export const CVPreviewToolbar: React.FC<CVPreviewToolbarProps> = ({
  isEditing,
  showFeaturePreviews,
  autoSaveEnabled,
  hasUnsavedChanges,
  lastSaved,
  selectedTemplate,
  showPreviewBanner,
  appliedImprovements,
  onToggleEditing,
  onToggleFeaturePreviews,
  onToggleAutoSave,
  onExpandAllSections,
  onCollapseAllSections,
  onCloseBanner
}) => {
  return (
    <div className="cv-preview-toolbar-wrapper">
      {/* Improvements Applied Banner */}
      {appliedImprovements && showPreviewBanner && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400 p-4 mb-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✨</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-900">
                  AI Improvements Applied
                </h3>
                <p className="text-sm text-green-700">
                  Your CV content has been enhanced with AI-powered improvements. The preview below shows your optimized CV.
                </p>
              </div>
            </div>
            <button
              onClick={onCloseBanner}
              className="text-green-400 hover:text-green-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Live Preview Section - Enhanced Design */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-xl border border-slate-200/80 shadow-lg shadow-slate-500/5 mb-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  Live Preview
                  {hasUnsavedChanges && (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-orange-400/20 to-amber-400/20 text-orange-600 px-3 py-1.5 rounded-full border border-orange-200 animate-pulse font-medium">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                      {autoSaveEnabled ? 'Auto-saving...' : 'Unsaved'}
                    </span>
                  )}
                  {lastSaved && !hasUnsavedChanges && (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-emerald-400/20 to-green-400/20 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-200 font-medium">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">Interactive preview of your enhanced CV</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200/60 font-medium shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template
            </span>
          </div>
        </div>
        
        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 pt-4">
          {/* Secondary Controls Group */}
          <div className="flex items-center gap-3">
            {/* Auto-save Toggle */}
            <button
              onClick={onToggleAutoSave}
              className={`inline-flex items-center gap-2 px-4 h-12 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                autoSaveEnabled
                  ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-700 border border-emerald-300/50 shadow-sm hover:shadow-emerald-500/20'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:shadow-sm'
              }`}
              title={autoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled'}
            >
              <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
                autoSaveEnabled ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-400'
              }`} />
              Auto-save
            </button>
            
            {/* Section Controls */}
            <div className="flex items-center h-12 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={onExpandAllSections}
                className="flex items-center gap-1.5 px-4 h-full text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all"
                title="Expand all sections"
              >
                <span className="text-xs">▼</span>
                All
              </button>
              <div className="w-px h-6 bg-slate-300" />
              <button
                onClick={onCollapseAllSections}
                className="flex items-center gap-1.5 px-4 h-full text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all"
                title="Collapse all sections"
              >
                <span className="text-xs">▶</span>
                All
              </button>
            </div>
            
            {/* Preview Toggle */}
            <button
              onClick={onToggleFeaturePreviews}
              className={`inline-flex items-center gap-2 px-4 h-12 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                showFeaturePreviews
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/40'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 hover:shadow-sm border border-slate-300'
              }`}
            >
              {showFeaturePreviews ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showFeaturePreviews ? 'Hide' : 'Show'} Previews
            </button>
          </div>
          
          {/* Primary Action - Edit CV Button */}
          <button
            onClick={onToggleEditing}
            className={`inline-flex items-center gap-2.5 px-6 h-12 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105 transform ${
              isEditing
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:from-emerald-600 hover:to-green-600'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-cyan-700'
            }`}
          >
            <div className="relative">
              {isEditing ? (
                <>
                  <Save className="w-5 h-5" />
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                </>
              ) : (
                <Edit3 className="w-5 h-5" />
              )}
            </div>
            {isEditing ? 'Save Changes' : 'Edit CV'}
            {!isEditing && (
              <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};