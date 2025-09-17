import React, { useCallback, useState, useMemo } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Image, Video, Music, File, X, Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ImageUploadService } from '../../services/imageUploadService';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  onMultipleFiles?: (files: File[]) => void;
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  accept?: FileTypeCategory | FileTypeCategory[];
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  userId?: string;
  jobId?: string;
  category?: 'portfolio' | 'documents' | 'media' | 'profiles';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  autoUpload?: boolean;
  showPreview?: boolean;
}

type FileTypeCategory = 'documents' | 'images' | 'videos' | 'audio' | 'all';

interface UploadResult {
  file: File;
  url?: string;
  path?: string;
  success: boolean;
  error?: string;
}

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
}

interface FilePreview {
  file: File;
  id: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress?: number;
  result?: UploadResult;
}

const FILE_TYPE_CONFIGS = {
  documents: {
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    icon: FileText,
    description: 'PDF, DOCX, DOC, CSV, TXT, XLSX, XLS'
  },
  images: {
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    },
    icon: Image,
    description: 'JPG, PNG, WebP, GIF'
  },
  videos: {
    accept: {
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/ogg': ['.ogv'],
      'video/quicktime': ['.mov']
    },
    icon: Video,
    description: 'MP4, WebM, OGV, MOV'
  },
  audio: {
    accept: {
      'audio/mp3': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
      'audio/mpeg': ['.mp3']
    },
    icon: Music,
    description: 'MP3, WAV, OGG'
  },
  all: {
    accept: {},
    icon: File,
    description: 'Any file type'
  }
};

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onMultipleFiles,
  onUploadComplete,
  onUploadProgress,
  accept = 'documents',
  multiple = false,
  maxFiles = 10,
  maxSize = DEFAULT_MAX_SIZE,
  userId,
  jobId,
  category = 'media',
  isLoading = false,
  disabled = false,
  className = '',
  autoUpload = false,
  showPreview = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Determine accepted file types
  const acceptConfig = useMemo(() => {
    const acceptTypes = Array.isArray(accept) ? accept : [accept];
    let combinedAccept = {};
    let descriptions: string[] = [];
    let IconComponent = File;

    acceptTypes.forEach(type => {
      const config = FILE_TYPE_CONFIGS[type];
      if (config) {
        combinedAccept = { ...combinedAccept, ...config.accept };
        descriptions.push(config.description);
        if (acceptTypes.length === 1) {
          IconComponent = config.icon;
        }
      }
    });

    return {
      accept: combinedAccept,
      description: descriptions.join(', '),
      icon: IconComponent
    };
  }, [accept]);

  // Handle file uploads
  const uploadFiles = useCallback(async (files: FilePreview[]) => {
    if (!userId) {
      setError('User ID required for upload');
      return;
    }

    setIsUploading(true);
    const results: UploadResult[] = [];

    for (const preview of files) {
      try {
        // Update status
        setPreviews(prev => prev.map(p => 
          p.id === preview.id 
            ? { ...p, status: 'uploading' as const } 
            : p
        ));

        // Upload file based on type
        let uploadResult;
        if (preview.file.type.startsWith('image/')) {
          uploadResult = await ImageUploadService.uploadMediaFile(
            preview.file,
            userId,
            category,
            jobId,
            (progress) => {
              setPreviews(prev => prev.map(p => 
                p.id === preview.id 
                  ? { ...p, progress: progress.progress } 
                  : p
              ));
              onUploadProgress?.({
                fileId: preview.id,
                fileName: preview.file.name,
                progress: progress.progress,
                status: 'uploading'
              });
            }
          );
        } else {
          // For non-images, use a generic upload method (to be implemented)
          uploadResult = {
            url: '',
            path: '',
            success: false,
            error: 'Upload not yet implemented for this file type'
          };
        }

        const result: UploadResult = {
          file: preview.file,
          url: uploadResult.url,
          path: uploadResult.path,
          success: uploadResult.success,
          error: uploadResult.error
        };

        results.push(result);

        // Update preview status
        setPreviews(prev => prev.map(p => 
          p.id === preview.id 
            ? { 
                ...p, 
                status: uploadResult.success ? 'complete' as const : 'error' as const,
                result
              } 
            : p
        ));

      } catch (error) {
        const result: UploadResult = {
          file: preview.file,
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        };
        results.push(result);
        
        setPreviews(prev => prev.map(p => 
          p.id === preview.id 
            ? { ...p, status: 'error' as const, result } 
            : p
        ));
      }
    }

    setIsUploading(false);
    onUploadComplete?.(results);
  }, [userId, jobId, category, onUploadComplete, onUploadProgress]);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError(`Please upload a valid file type: ${acceptConfig.description}`);
      } else if (rejection.errors[0]?.code === 'too-many-files') {
        setError(`Maximum ${maxFiles} files allowed`);
      } else {
        setError('Invalid file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      // Legacy single file callback
      onFileSelect?.(acceptedFiles[0]);
      onMultipleFiles?.(acceptedFiles);

      // Create previews for display
      if (showPreview) {
        const newPreviews = acceptedFiles.map(file => ({
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          status: 'pending' as const
        }));
        setPreviews(prev => [...prev, ...newPreviews]);

        // Auto upload if enabled
        if (autoUpload) {
          uploadFiles(newPreviews);
        }
      }
    }
  }, [onFileSelect, onMultipleFiles, maxSize, acceptConfig.description, maxFiles, showPreview, autoUpload, uploadFiles]);

  // Remove file from preview
  const removeFile = useCallback((fileId: string) => {
    setPreviews(prev => {
      const preview = prev.find(p => p.id === fileId);
      if (preview?.preview) {
        URL.revokeObjectURL(preview.preview);
      }
      return prev.filter(p => p.id !== fileId);
    });
  }, []);

  // Upload pending files manually
  const handleManualUpload = useCallback(() => {
    const pendingFiles = previews.filter(p => p.status === 'pending');
    if (pendingFiles.length > 0) {
      uploadFiles(pendingFiles);
    }
  }, [previews, uploadFiles]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptConfig.accept,
    maxSize,
    multiple,
    maxFiles,
    disabled: disabled || isLoading || isUploading
  });

  const IconComponent = acceptConfig.icon;

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
          isDragActive && !isDragReject && "border-cyan-500 bg-cyan-900/20",
          isDragReject && "border-red-500 bg-red-900/20",
          (disabled || isLoading || isUploading) && "opacity-50 cursor-not-allowed",
          !isDragActive && !isDragReject && !disabled && !isLoading && !isUploading && "border-gray-600 hover:border-gray-500 bg-gray-800/50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          {isDragReject ? (
            <>
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-400">Invalid file type</p>
              <p className="text-sm text-red-500 mt-2">
                Please upload: {acceptConfig.description}
              </p>
            </>
          ) : (
            <>
              {isUploading ? (
                <Loader2 className="w-12 h-12 text-cyan-500 mb-4 animate-spin" />
              ) : (
                <IconComponent className="w-12 h-12 text-gray-500 mb-4" />
              )}
              <p className="text-lg font-medium text-gray-200">
                {isDragActive 
                  ? "Drop files here" 
                  : isUploading 
                  ? "Uploading files..." 
                  : `Drag & Drop ${multiple ? 'files' : 'file'} here`}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                or click to browse
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                <IconComponent className="w-4 h-4" />
                <span>
                  {acceptConfig.description} (Max {maxSize / (1024 * 1024)}MB{multiple ? `, ${maxFiles} files` : ''})
                </span>
              </div>
            </>
          )}
        </div>

        {(isLoading || isUploading) && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
              <p className="mt-2 text-sm text-gray-300">
                {isUploading ? 'Uploading...' : 'Processing...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Previews */}
      {showPreview && previews.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">Files ({previews.length})</h3>
            {!autoUpload && previews.some(p => p.status === 'pending') && (
              <button
                onClick={handleManualUpload}
                disabled={isUploading}
                className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700 disabled:opacity-50"
              >
                Upload All
              </button>
            )}
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {previews.map((preview) => (
              <div key={preview.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                {/* File preview/icon */}
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {preview.preview ? (
                    <img 
                      src={preview.preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <IconComponent className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {preview.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(preview.file.size / 1024).toFixed(1)} KB
                  </p>
                  
                  {/* Progress bar */}
                  {preview.status === 'uploading' && typeof preview.progress === 'number' && (
                    <div className="w-full bg-gray-600 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${preview.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2">
                  {preview.status === 'pending' && (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  )}
                  {preview.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                  )}
                  {preview.status === 'complete' && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {preview.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removeFile(preview.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;