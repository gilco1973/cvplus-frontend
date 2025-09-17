import React, { useState } from 'react';
import { Globe, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../hooks/useTranslation';

interface URLInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export const URLInput: React.FC<URLInputProps> = ({ onSubmit, isLoading = false }) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateURL = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError(t('forms.urlInput.validation.required'));
      return;
    }

    if (!validateURL(url)) {
      setError(t('forms.urlInput.validation.invalid'));
      return;
    }

    onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('forms.urlInput.placeholder')}
            className={cn(
              "w-full pl-12 pr-4 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-gray-800 text-gray-100 placeholder-gray-500",
              error 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
            )}
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all",
            isLoading
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-cyan-600 text-white hover:bg-cyan-700"
          )}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {t('forms.urlInput.button.processing')}
            </>
          ) : (
            <>
              {t('forms.urlInput.button.submit')}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            {t('forms.urlInput.help')}
          </p>
        </div>
      </div>
    </form>
  );
};