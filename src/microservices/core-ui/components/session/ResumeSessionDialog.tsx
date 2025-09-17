// ResumeSessionDialog - UI component for resuming sessions
import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  Clock, 
  Play, 
  X, 
  FileText, 
  ChevronRight,
  Calendar,
  User,
  Trash2
} from 'lucide-react';
import type { SessionState, CVStep } from '../../types/session';

interface ResumeSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionState[];
  onResume: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
  loading?: boolean;
  title?: string;
  description?: string;
}

const stepDisplayNames: Record<CVStep, string> = {
  upload: 'File Upload',
  processing: 'Processing',
  analysis: 'Analysis',
  features: 'Feature Selection',
  templates: 'Template Selection',
  preview: 'Preview',
  results: 'Results',
  keywords: 'Keyword Optimization',
  completed: 'Completed'
};

const stepIcons: Record<CVStep, React.ReactNode> = {
  upload: <FileText className="w-4 h-4" />,
  processing: <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />,
  analysis: <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />,
  features: <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full" />,
  templates: <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />,
  preview: <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />,
  results: <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-full" />,
  keywords: <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />,
  completed: <div className="w-4 h-4 bg-green-500 rounded-full" />
};

export const ResumeSessionDialog: React.FC<ResumeSessionDialogProps> = ({
  isOpen,
  onClose,
  sessions,
  onResume,
  onDelete,
  loading = false,
  title = "Resume Your Progress",
  description = "You have incomplete CV sessions. Would you like to continue where you left off?"
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleResume = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    onResume(sessionId);
  };

  const handleDelete = async (sessionId: string) => {
    if (confirmDelete === sessionId) {
      onDelete?.(sessionId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(sessionId);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage < 25) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    if (percentage < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="relative px-6 py-4 border-b border-gray-200">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 text-center">
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600 mb-6 text-center">
                    {description}
                  </p>

                  {sessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No resumable sessions found</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {sessions.map((session) => (
                        <div
                          key={session.sessionId}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              {/* Session Info */}
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="flex-shrink-0">
                                  {stepIcons[session.currentStep]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {stepDisplayNames[session.currentStep]}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {formatTimeAgo(session.lastActiveAt)}
                                  </p>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                  <div className="text-xs text-gray-500 mb-1">
                                    {Math.round(session.progressPercentage)}% complete
                                  </div>
                                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-300 ${getProgressColor(session.progressPercentage)}`}
                                      style={{ width: `${session.progressPercentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Additional Info */}
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                {session.formData?.userInstructions && (
                                  <div className="flex items-center space-x-1">
                                    <User className="w-3 h-3" />
                                    <span>Custom instructions</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    Started {formatTimeAgo(session.createdAt)}
                                  </span>
                                </div>
                                {session.jobId && (
                                  <div className="flex items-center space-x-1">
                                    <FileText className="w-3 h-3" />
                                    <span>Job ID: {session.jobId.slice(-8)}</span>
                                  </div>
                                )}
                              </div>

                              {/* Form data preview */}
                              {session.formData && (
                                <div className="mt-2 text-xs text-gray-600">
                                  {session.formData.targetRole && (
                                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2 mb-1">
                                      {session.formData.targetRole}
                                    </span>
                                  )}
                                  {session.formData.selectedTemplateId && (
                                    <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full mr-2 mb-1">
                                      Template selected
                                    </span>
                                  )}
                                  {session.formData.selectedFeatures && session.formData.selectedFeatures.length > 0 && (
                                    <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2 mb-1">
                                      {session.formData.selectedFeatures.length} features
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {onDelete && (
                                <button
                                  onClick={() => handleDelete(session.sessionId)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    confirmDelete === session.sessionId
                                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                  }`}
                                  title={confirmDelete === session.sessionId ? 'Click again to confirm' : 'Delete session'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleResume(session.sessionId)}
                                disabled={loading && selectedSessionId === session.sessionId}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {loading && selectedSessionId === session.sessionId ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                                <span>Resume</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Sessions are automatically saved and synced across devices
                    </p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Start Fresh Instead
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};