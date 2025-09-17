import React from 'react';
import { Routes, Route } from 'react-router-dom';

/**
 * CVProcessingPage - Orchestrates CV processing workflow
 *
 * TODO: Will integrate with @cvplus/processing via orchestration pattern
 * Note: Direct Layer 2 imports removed for architectural compliance
 *
 * Routes:
 * - /cv-processing - Main CV upload interface
 * - /cv-processing/analysis/:jobId - Analysis results
 * - /cv-processing/generated/:jobId - Generated CV display
 */

// Temporary placeholder components - will be replaced with orchestration pattern
const CVUpload: React.FC<{
  onUploadComplete: (jobId: string) => void;
  onUploadError: (error: Error) => void;
  onProcessingStart: (jobId: string) => void;
  showFeatureSelection: boolean;
  showDetailedSteps: boolean;
  maxFileSize: number;
}> = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">CV Upload</h2>
    <p className="text-gray-600">
      CV upload component will be loaded via orchestration pattern.
      Direct Layer 2 import removed for architectural compliance.
    </p>
  </div>
);

const CVAnalysisResults: React.FC<{
  onExport: (format: string) => void;
  onShare: () => void;
  onGenerateMultimedia: (type: string) => void;
  onApplyRecommendation: (id: string) => void;
}> = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">CV Analysis Results</h2>
    <p className="text-gray-600">
      Analysis results component will be loaded via orchestration pattern.
      Direct Layer 2 import removed for architectural compliance.
    </p>
  </div>
);

const GeneratedCVDisplay: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6 h-full">
    <h2 className="text-xl font-semibold mb-4">Generated CV Display</h2>
    <p className="text-gray-600">
      CV display component will be loaded via orchestration pattern.
      Direct Layer 2 import removed for architectural compliance.
    </p>
  </div>
);
const CVProcessingPage: React.FC = () => {
  const handleUploadComplete = (jobId: string) => {
    // Navigate to analysis results when upload completes
    console.log('Upload completed for job:', jobId);
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
  };

  const handleProcessingStart = (jobId: string) => {
    console.log('Processing started for job:', jobId);
  };

  return (
    <div className="h-full overflow-auto">
      <Routes>
        {/* Main CV Upload Route */}
        <Route
          path="/"
          element={
            <div className="max-w-4xl mx-auto p-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  CV Processing
                </h1>
                <p className="text-gray-600">
                  Upload your CV and let AI enhance it with powerful insights and optimizations.
                </p>
              </div>

              <CVUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                onProcessingStart={handleProcessingStart}
                showFeatureSelection={true}
                showDetailedSteps={true}
                maxFileSize={10 * 1024 * 1024} // 10MB
              />
            </div>
          }
        />

        {/* Analysis Results Route */}
        <Route
          path="/analysis/:jobId"
          element={
            <div className="max-w-7xl mx-auto p-6">
              <CVAnalysisResults
                onExport={(format) => console.log(`Exporting as ${format}`)}
                onShare={() => console.log('Sharing results')}
                onGenerateMultimedia={(type) => console.log(`Generating ${type}`)}
                onApplyRecommendation={(id) => console.log(`Applying recommendation ${id}`)}
              />
            </div>
          }
        />

        {/* Generated CV Display Route */}
        <Route
          path="/generated/:jobId"
          element={
            <div className="h-full">
              <GeneratedCVDisplay />
            </div>
          }
        />

        {/* Fallback for unmatched routes */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Page Not Found
                </h2>
                <p className="text-gray-600 mb-4">
                  The CV processing page you're looking for doesn't exist.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default CVProcessingPage;