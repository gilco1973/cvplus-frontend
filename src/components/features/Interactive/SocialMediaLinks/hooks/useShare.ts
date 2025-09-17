import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useSocialMediaShare = () => {
  const handleShare = useCallback(async (platform: string, url: string) => {
    if (!navigator.share) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success(`${platform} link copied to clipboard`);
      } catch {
        toast.error('Sharing not supported on this device');
      }
      return;
    }

    try {
      await navigator.share({
        title: `My ${platform} Profile`,
        text: `Check out my ${platform} profile`,
        url
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error('Failed to share link');
      }
    }
  }, []);

  return { handleShare };
};
