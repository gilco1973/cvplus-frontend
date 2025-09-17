/**
 * ProfilePictureUpload Component
 * 
 * Provides a user-friendly interface for uploading and previewing profile pictures.
 * Features drag-and-drop, image preview, and real-time validation.
 */

import React, { useState, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  Loader2, 
  RotateCcw,
  Crop,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ImageUploadService } from '../services/imageUploadService';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onImageUpdate: (imageUrl: string, imagePath: string) => void;
  userId: string;
  jobId?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  userName?: string;
  userTitle?: string;
  showUserInfo?: boolean;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  onImageUpdate,
  userId,
  jobId,
  className = '',
  size = 'large',
  disabled = false,
  userName = '',
  userTitle = '',
  showUserInfo = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20', 
    large: 'w-24 h-24'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (disabled) return;

    // Validate file
    const validation = ImageUploadService.validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    // Create preview
    const preview = ImageUploadService.createPreviewUrl(file);
    setPreviewUrl(preview);
    setSelectedFile(file);
  }, [disabled]);

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      toast.error('Please drop an image file');
    }
  };

  // Upload selected image
  const handleUpload = async () => {
    if (!selectedFile || !userId || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await ImageUploadService.uploadProfilePicture(
        selectedFile,
        userId,
        jobId
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Clean up preview
      if (previewUrl) {
        ImageUploadService.revokePreviewUrl(previewUrl);
      }

      // Update parent component
      onImageUpdate(result.url, result.path);
      
      // Reset state
      setPreviewUrl(null);
      setSelectedFile(null);
      setUploadProgress(0);
      
      toast.success('Profile picture updated successfully!');
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel upload
  const handleCancel = () => {
    if (previewUrl) {
      ImageUploadService.revokePreviewUrl(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open file selector
  const openFileSelector = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayImage = previewUrl || currentImageUrl;
  const hasImage = !!displayImage;
  const showUploadButtons = !!selectedFile;

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Overlapping upload circle - positioned in bottom-right */}
      {!disabled && (
        <div 
          className={`
            profile-upload-circle
            absolute -bottom-1 -right-1 z-10 cursor-pointer group
            w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg
            flex items-center justify-center
            opacity-0 hover:opacity-100 transition-opacity duration-200
            hover:bg-blue-700 hover:scale-110 transition-all duration-200
            ${dragActive ? 'opacity-100 scale-110' : ''}
            ${isUploading ? 'opacity-100' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={(e) => {
            e.stopPropagation();
            openFileSelector();
          }}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Camera className="w-4 h-4 text-white" />
          )}

          {/* Upload progress ring for small circle */}
          {isUploading && uploadProgress > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-8 h-8 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="transparent"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 12} ${2 * Math.PI * 12}`}
                  strokeDashoffset={`${2 * Math.PI * 12 * (1 - uploadProgress / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Upload action buttons - improved positioning */}
      {showUploadButtons && !isUploading && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpload();
            }}
            className="p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors border-2 border-white"
            title="Upload image"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
            className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors border-2 border-white"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag overlay - improved visibility */}
      {dragActive && !disabled && (
        <div className="absolute -inset-4 border-2 border-dashed border-cyan-400 rounded-full bg-cyan-900/20 backdrop-blur-sm flex items-center justify-center pointer-events-none z-30">
          <div className="text-white text-center">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium">Drop image here</div>
          </div>
        </div>
      )}


      {/* User info display - when showUserInfo is enabled */}
      {showUserInfo && userName && (
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap pointer-events-none z-10">
          <div className="text-lg font-bold text-white mb-1 drop-shadow-lg">
            {userName}
          </div>
          {userTitle && (
            <div className="text-sm text-white/80 drop-shadow-lg">
              {userTitle}
            </div>
          )}
        </div>
      )}

      {/* Status indicator */}
      {selectedFile && !isUploading && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;