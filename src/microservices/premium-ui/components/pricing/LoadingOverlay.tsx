import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay = ({ isVisible }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-neutral-800/90 backdrop-blur-sm z-10 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
        <p className="text-neutral-100 font-semibold mb-2">
          Loading secure checkout...
        </p>
        <p className="text-sm text-neutral-400">
          This may take a few seconds
        </p>
      </div>
    </div>
  );
};