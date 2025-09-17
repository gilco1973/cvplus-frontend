import { CheckCircle } from 'lucide-react';

interface ProcessingOverlayProps {
  isVisible: boolean;
}

export const ProcessingOverlay = ({ isVisible }: ProcessingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-neutral-800/95 backdrop-blur-sm z-20 flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4 animate-pulse" />
        <p className="text-xl font-semibold text-neutral-100 mb-2">
          Payment Successful!
        </p>
        <p className="text-neutral-300 mb-4">
          Activating your premium features...
        </p>
        <div className="w-48 bg-neutral-700 rounded-full h-2 mx-auto">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full animate-pulse" 
            style={{width: '75%'}}
          />
        </div>
      </div>
    </div>
  );
};