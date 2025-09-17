/**
 * Version History Component
 *
 * Modal for viewing, managing, and reverting CV versions
 * with diff visualization and change tracking.
 */

import React, { useState } from 'react';
import {
  X,
  Clock,
  GitBranch,
  RotateCcw,
  Eye,
  Save,
  Trash2,
  Plus,
  FileText,
  User
} from 'lucide-react';

import type { CVVersion, VersionChange } from './types';

interface VersionHistoryProps {
  versions: CVVersion[];
  onVersionSave: (description: string) => void;
  onClose: () => void;
  loading?: boolean;
}

/**
 * Version History Component
 */
export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  onVersionSave,
  onClose,
  loading = false
}) => {
  const [selectedVersion, setSelectedVersion] = useState<CVVersion | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveDescription, setSaveDescription] = useState('');

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return `${Math.floor(diffMs / (1000 * 60))} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get change type icon and color
  const getChangeInfo = (type: VersionChange['type']) => {
    const info = {
      create: { icon: Plus, color: 'text-green-400', bg: 'bg-green-400/20' },
      update: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/20' },
      delete: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-400/20' },
      move: { icon: GitBranch, color: 'text-purple-400', bg: 'bg-purple-400/20' },
      style: { icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-400/20' },
      format: { icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-400/20' }
    };
    return info[type] || info.update;
  };

  // Handle save new version
  const handleSaveVersion = () => {
    if (saveDescription.trim()) {
      onVersionSave(saveDescription);
      setSaveDescription('');
      setShowSaveDialog(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="w-full max-w-5xl h-[90vh] bg-gray-800 rounded-lg shadow-2xl border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-semibold text-white">Version History</h2>
            <p className="text-gray-400 mt-1">
              View and manage CV versions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Version</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Version list */}
          <div className="w-1/2 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">
                Versions ({versions.length})
              </h3>

              {versions.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No versions saved yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Save your current changes to create the first version.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((version, index) => (
                    <div
                      key={version.id}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all
                        ${selectedVersion?.id === version.id
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                        }
                      `}
                      onClick={() => setSelectedVersion(version)}
                    >
                      {/* Version header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">
                            v{version.version}
                          </span>
                          {index === 0 && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                              Latest
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatDate(version.createdAt)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-300 mb-2">
                        {version.description || 'No description'}
                      </p>

                      {/* Author and changes */}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{version.author || 'Unknown'}</span>
                        </div>
                        <span>{version.changes.length} changes</span>
                      </div>

                      {/* Change types preview */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Array.from(new Set(version.changes.map(c => c.type))).slice(0, 4).map(type => {
                          const { icon: Icon, color } = getChangeInfo(type);
                          return (
                            <div key={type} className={`flex items-center space-x-1 text-xs ${color}`}>
                              <Icon className="w-3 h-3" />
                              <span className="capitalize">{type}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Version details */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {selectedVersion ? (
                <div>
                  {/* Version info */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">
                        Version {selectedVersion.version}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                          title="Preview version"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Preview</span>
                        </button>
                        <button
                          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/20 rounded-md transition-colors"
                          title="Restore this version"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Restore</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Created:</span>
                          <span className="text-white ml-2">
                            {selectedVersion.createdAt.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Author:</span>
                          <span className="text-white ml-2">
                            {selectedVersion.author || 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Size:</span>
                          <span className="text-white ml-2">
                            {(selectedVersion.metadata.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Changes:</span>
                          <span className="text-white ml-2">
                            {selectedVersion.changes.length}
                          </span>
                        </div>
                      </div>

                      {selectedVersion.description && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <span className="text-gray-400">Description:</span>
                          <p className="text-white mt-1">{selectedVersion.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Changes */}
                  <div>
                    <h4 className="text-md font-medium text-white mb-4">
                      Changes ({selectedVersion.changes.length})
                    </h4>

                    {selectedVersion.changes.length === 0 ? (
                      <p className="text-gray-400 text-sm">No changes recorded</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedVersion.changes.map((change, index) => {
                          const { icon: Icon, color, bg } = getChangeInfo(change.type);

                          return (
                            <div
                              key={index}
                              className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg"
                            >
                              <div className={`p-2 rounded-lg ${bg}`}>
                                <Icon className={`w-4 h-4 ${color}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`text-sm font-medium ${color} capitalize`}>
                                    {change.type}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {change.section}
                                  </span>
                                </div>
                                {change.description && (
                                  <p className="text-sm text-gray-300">
                                    {change.description}
                                  </p>
                                )}
                                {change.field && (
                                  <div className="mt-2 text-xs">
                                    <span className="text-gray-400">Field:</span>
                                    <span className="text-gray-300 ml-1">{change.field}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Select a version to view details</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Click on a version from the list to see its changes and options.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save version dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90">
          <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-2xl border border-gray-600 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Save New Version</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Describe what changed in this version..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVersion}
                disabled={!saveDescription.trim() || loading}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Version</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};