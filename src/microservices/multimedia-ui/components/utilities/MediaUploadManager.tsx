/**
 * MediaUploadManager Component
 * 
 * Comprehensive media upload management system that coordinates file uploads,
 * progress tracking, cropping, and batch processing with intelligent error recovery.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  Image,
  File as FileIcon,
  Trash2,
  Edit3,
  Download,
  FolderOpen,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import FileUpload from './FileUpload';
import UploadProgress, { UploadProgressItem } from './UploadProgress';
import ImageCropper from './ImageCropper';
import { ImageUploadService } from '../../services/imageUploadService';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'document' | 'video' | 'audio';
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error' | 'cropping';
  progress: number;
  url?: string;
  path?: string;
  error?: string;
  thumbnail?: string;
  metadata?: {
    size: number;
    dimensions?: { width: number; height: number };
    duration?: number;
  };
}

interface MediaUploadManagerProps {
  userId: string;
  jobId?: string;
  category?: 'portfolio' | 'documents' | 'media' | 'profiles';
  accept?: ('images' | 'documents' | 'videos' | 'audio')[];
  maxFiles?: number;
  maxFileSize?: number;
  allowCropping?: boolean;
  autoUpload?: boolean;
  showProgress?: boolean;
  showPreview?: boolean;
  onUploadComplete?: (files: MediaFile[]) => void;
  onUploadProgress?: (progress: { completed: number; total: number; overall: number }) => void;
  onError?: (error: string) => void;
  className?: string;
}

const MediaUploadManager: React.FC<MediaUploadManagerProps> = ({
  userId,
  jobId,
  category = 'media',
  accept = ['images', 'documents'],
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowCropping = true,
  autoUpload = false,
  showProgress = true,
  showPreview = true,
  onUploadComplete,
  onUploadProgress,
  onError,
  className
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [croppingFile, setCroppingFile] = useState<MediaFile | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [batchSettings, setBatchSettings] = useState({
    compressImages: true,
    targetQuality: 0.8,
    maxDimensions: { width: 1920, height: 1080 },
    generateThumbnails: true
  });
  
  const fileUploadRef = useRef<HTMLDivElement>(null);

  // Determine file type from MIME type
  const getFileType = useCallback((file: File): MediaFile['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  }, []);

  // Create thumbnail for images
  const createThumbnail = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve('');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img') as HTMLImageElement;

      img.onload = () => {
        const maxSize = 150;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Handle new files from FileUpload component
  const handleFilesSelected = useCallback(async (files: File[]) => {
    const newMediaFiles: MediaFile[] = [];

    for (const file of files) {
      const fileType = getFileType(file);
      const thumbnail = await createThumbnail(file);
      
      const mediaFile: MediaFile = {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        type: fileType,
        status: 'pending',
        progress: 0,
        thumbnail,
        metadata: {
          size: file.size
        }
      };

      newMediaFiles.push(mediaFile);
    }

    setMediaFiles(prev => [...prev, ...newMediaFiles]);

    // Auto-upload if enabled
    if (autoUpload) {
      const fileIds = newMediaFiles.map(f => f.id);
      setUploadQueue(prev => [...prev, ...fileIds]);
      startUpload();
    }
  }, [getFileType, createThumbnail, autoUpload]);

  // Start upload process
  const startUpload = useCallback(async (specificIds?: string[]) => {
    if (isUploading) return;
    
    const filesToUpload = specificIds 
      ? mediaFiles.filter(f => specificIds.includes(f.id) && f.status === 'pending')
      : mediaFiles.filter(f => f.status === 'pending');

    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    let completedCount = 0;

    for (const mediaFile of filesToUpload) {
      try {
        // Update status to uploading
        setMediaFiles(prev => prev.map(f => 
          f.id === mediaFile.id 
            ? { ...f, status: 'uploading' as const, progress: 0 } 
            : f
        ));

        // Upload based on file type
        let uploadResult;
        if (mediaFile.type === 'image') {
          // Compress image if needed
          let fileToUpload = mediaFile.file;
          if (batchSettings.compressImages) {
            fileToUpload = await ImageUploadService.compressImage(
              mediaFile.file,
              batchSettings.maxDimensions.width,
              batchSettings.targetQuality
            );
          }

          uploadResult = await ImageUploadService.uploadMediaFile(
            fileToUpload,
            userId,
            category,
            jobId,
            (progress) => {
              setMediaFiles(prev => prev.map(f => 
                f.id === mediaFile.id 
                  ? { ...f, progress: progress.progress } 
                  : f
              ));
            }
          );
        } else {
          // For non-images, we'd need additional upload services
          // For now, simulate upload
          uploadResult = {
            url: '',
            path: '',
            success: false,
            error: 'Upload not yet implemented for this file type'
          };
        }

        // Update file with result
        setMediaFiles(prev => prev.map(f => 
          f.id === mediaFile.id 
            ? {
                ...f,
                status: uploadResult.success ? 'complete' as const : 'error' as const,
                progress: uploadResult.success ? 100 : f.progress,
                url: uploadResult.url,
                path: uploadResult.path,
                error: uploadResult.error
              } 
            : f
        ));

        if (uploadResult.success) {
          completedCount++;
        } else {
          onError?.(`Failed to upload ${mediaFile.file.name}: ${uploadResult.error}`);
        }

      } catch (error) {
        setMediaFiles(prev => prev.map(f => 
          f.id === mediaFile.id 
            ? {
                ...f,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Upload failed'
              } 
            : f
        ));
        onError?.(`Error uploading ${mediaFile.file.name}: ${error}`);
      }

      // Update overall progress
      onUploadProgress?.({
        completed: completedCount,
        total: filesToUpload.length,
        overall: Math.round((completedCount / filesToUpload.length) * 100)
      });
    }

    setIsUploading(false);
    
    // Call completion callback
    const completedFiles = mediaFiles.filter(f => f.status === 'complete');
    onUploadComplete?.(completedFiles);
  }, [isUploading, mediaFiles, userId, category, jobId, batchSettings, onError, onUploadProgress, onUploadComplete]);

  // Remove file from list
  const removeFile = useCallback((fileId: string) => {
    setMediaFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.thumbnail) {
        URL.revokeObjectURL(file.thumbnail);
      }
      return prev.filter(f => f.id !== fileId);
    });
    setUploadQueue(prev => prev.filter(id => id !== fileId));
  }, []);

  // Open cropper for image
  const openCropper = useCallback((fileId: string) => {
    const file = mediaFiles.find(f => f.id === fileId);
    if (file && file.type === 'image') {
      setCroppingFile(file);
    }
  }, [mediaFiles]);

  // Handle crop completion
  const handleCropComplete = useCallback((croppedFile: File) => {
    if (!croppingFile) return;

    setMediaFiles(prev => prev.map(f => 
      f.id === croppingFile.id 
        ? { ...f, file: croppedFile, status: 'pending' as const } 
        : f
    ));
    setCroppingFile(null);
  }, [croppingFile]);

  // Convert to upload progress items for UploadProgress component
  const uploadProgressItems: UploadProgressItem[] = mediaFiles.map(file => ({
    id: file.id,
    fileName: file.file.name,
    fileSize: file.file.size,
    progress: file.progress,
    status: file.status === 'cropping' ? 'pending' : file.status,
    error: file.error,
    url: file.url
  }));

  // Get file icon based on type
  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return FileIcon;
      case 'audio': return FileIcon;
      default: return FileIcon;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Upload Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Compress Images</label>
              <input
                type="checkbox"
                checked={batchSettings.compressImages}
                onChange={(e) => setBatchSettings(prev => ({
                  ...prev,
                  compressImages: e.target.checked
                }))}
                className="rounded"
              />
            </div>
            
            {batchSettings.compressImages && (
              <div className="space-y-2">
                <label className="block text-sm text-gray-300">
                  Quality: {Math.round(batchSettings.targetQuality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={batchSettings.targetQuality}
                  onChange={(e) => setBatchSettings(prev => ({
                    ...prev,
                    targetQuality: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Upload Area */}
      <div ref={fileUploadRef}>
        <FileUpload
          accept={accept}
          multiple={true}
          maxFiles={maxFiles}
          maxSize={maxFileSize}
          userId={userId}
          jobId={jobId}
          category={category}
          onMultipleFiles={handleFilesSelected}
          showPreview={false} // We handle previews in this component
          autoUpload={false} // We manage uploads here
        />
      </div>

      {/* File Preview Grid */}
      {showPreview && mediaFiles.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-200">
              Files ({mediaFiles.length}/{maxFiles})
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-300 rounded transition-colors"
                title="Upload settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              {!autoUpload && mediaFiles.some(f => f.status === 'pending') && (
                <button
                  onClick={() => startUpload()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Upload All ({mediaFiles.filter(f => f.status === 'pending').length})
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaFiles.map((file) => {
              const IconComponent = getFileIcon(file.type);
              
              return (
                <div key={file.id} className="relative bg-gray-700 rounded-lg overflow-hidden">
                  {/* File preview */}
                  <div className="aspect-square flex items-center justify-center p-4 bg-gray-600">
                    {file.thumbnail ? (
                      <img 
                        src={file.thumbnail} 
                        alt={file.file.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <IconComponent className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  
                  {/* File info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-200 truncate" title={file.file.name}>
                      {file.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.file.size / 1024).toFixed(1)} KB
                    </p>
                    
                    {/* Progress bar */}
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <div className="w-full bg-gray-600 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {/* Status indicator */}
                    <div className="flex items-center gap-1 mt-2">
                      {file.status === 'complete' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {file.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      <span className="text-xs text-gray-400 capitalize">{file.status}</span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {file.type === 'image' && allowCropping && file.status === 'pending' && (
                      <button
                        onClick={() => openCropper(file.id)}
                        className="p-1.5 bg-gray-800/80 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                        title="Crop image"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1.5 bg-gray-800/80 text-gray-300 rounded hover:bg-red-600 hover:text-white transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Status overlay */}
                  {file.status !== 'pending' && file.status !== 'complete' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        {file.status === 'uploading' && (
                          <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
                        )}
                        <div className="text-sm capitalize">{file.status}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {showProgress && uploadProgressItems.length > 0 && (
        <UploadProgress
          items={uploadProgressItems}
          onRemove={removeFile}
          showDetails={true}
          compact={false}
        />
      )}

      {/* Image Cropper Modal */}
      {croppingFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-full overflow-auto">
            <ImageCropper
              imageFile={croppingFile.file}
              onCropComplete={handleCropComplete}
              onCancel={() => setCroppingFile(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploadManager;