/**
 * CVProcessingProvider - React Context Provider for CV Processing
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CVProcessingContextType {
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  currentJob?: string;
  setCurrentJob: (jobId?: string) => void;
  error?: string;
  setError: (error?: string) => void;
}

const CVProcessingContext = createContext<CVProcessingContextType | undefined>(undefined);

interface CVProcessingProviderProps {
  children: ReactNode;
}

export const CVProcessingProvider: React.FC<CVProcessingProviderProps> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const value = {
    isProcessing,
    setIsProcessing,
    currentJob,
    setCurrentJob,
    error,
    setError,
  };

  return (
    <CVProcessingContext.Provider value={value}>
      {children}
    </CVProcessingContext.Provider>
  );
};

export const useCVProcessingContext = (): CVProcessingContextType => {
  const context = useContext(CVProcessingContext);
  if (!context) {
    throw new Error('useCVProcessingContext must be used within a CVProcessingProvider');
  }
  return context;
};

export default CVProcessingProvider;