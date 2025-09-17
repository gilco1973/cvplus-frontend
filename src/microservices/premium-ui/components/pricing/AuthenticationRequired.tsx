import { XCircle } from 'lucide-react';

interface AuthenticationRequiredProps {
  onCancel: () => void;
}

export const AuthenticationRequired = ({ onCancel }: AuthenticationRequiredProps) => {
  return (
    <div className="bg-neutral-800 rounded-2xl shadow-xl border border-neutral-700 p-8 text-center">
      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-neutral-100 mb-2">
        Authentication Required
      </h3>
      <p className="text-neutral-300 mb-6">
        Please sign in to upgrade to Premium
      </p>
      <button
        onClick={onCancel}
        className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-600 transition-all duration-200"
      >
        Back to Sign In
      </button>
    </div>
  );
};