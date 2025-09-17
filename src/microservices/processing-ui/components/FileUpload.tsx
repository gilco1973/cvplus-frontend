import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../utils/autonomous-utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/csv': ['.csv']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading = false }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File size must be less than 10MB');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Please upload a PDF, DOCX, DOC, or CSV file');
      } else {
        setError('Invalid file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: isLoading
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
          isDragActive && !isDragReject && "border-cyan-500 bg-cyan-900/20",
          isDragReject && "border-red-500 bg-red-900/20",
          isLoading && "opacity-50 cursor-not-allowed",
          !isDragActive && !isDragReject && !isLoading && "border-gray-600 hover:border-gray-500 bg-gray-800/50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          {isDragReject ? (
            <>
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-400">Invalid file type</p>
              <p className="text-sm text-red-500 mt-2">
                Please upload a PDF, DOCX, DOC, or CSV file
              </p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-500 mb-4" />
              <p className="text-lg font-medium text-gray-200">
                {isDragActive ? "Drop your CV here" : "Drag & Drop your CV here"}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                or click to browse
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                <FileText className="w-4 h-4" />
                <span>PDF, DOCX, DOC, CSV (Max 10MB)</span>
              </div>
            </>
          )}
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
              <p className="mt-2 text-sm text-gray-300">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};
