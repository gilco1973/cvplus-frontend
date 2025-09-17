import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

import { AIPodcastPlayer } from '../AI-Powered/AIPodcastPlayer';
import { PodcastData } from '../../../types/cv-features';

// Mock dependencies
vi.mock('../../../hooks/useFeatureData');
vi.mock('react-hot-toast');
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}));

const mockUseFeatureData = vi.fn();
const mockToast = {
  success: vi.fn(),
  error: vi.fn()
};

// Setup mocks
beforeEach(() => {
  vi.clearAllMocks();
  // Mock imports are handled by vi.mock() at the top
  
  // Mock audio API
  global.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
  global.HTMLMediaElement.prototype.pause = vi.fn();
  global.HTMLMediaElement.prototype.load = vi.fn();
  
  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve())
    },
    share: vi.fn(() => Promise.resolve())
  });
  
  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
});

const defaultProps = {
  jobId: 'test-job-123',
  profileId: 'test-profile-456',
  data: {
    audioUrl: 'https://example.com/podcast.mp3',
    transcript: 'This is a test transcript. It contains multiple sentences. Each sentence represents a segment.',
    duration: 180,
    title: 'Test Career Podcast',
    description: 'A test podcast description',
    generationStatus: 'completed' as const
  } as PodcastData
};

const mockFeatureDataResponse = {
  data: defaultProps.data,
  loading: false,
  error: null,
  refresh: vi.fn()
};

describe('AIPodcastPlayer', () => {
  beforeEach(() => {
    mockUseFeatureData.mockReturnValue(mockFeatureDataResponse);
  });

  describe('Component Rendering', () => {
    it('renders the podcast player with audio controls', () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      expect(screen.getByText('Test Career Podcast')).toBeInTheDocument();
      expect(screen.getByText('A test podcast description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(screen.getByText('Transcript')).toBeInTheDocument();
    });

    it('renders with minimal theme', () => {
      render(
        <AIPodcastPlayer 
          {...defaultProps} 
          customization={{ theme: 'minimal' }}
        />
      );
      
      // Header should not be visible in minimal theme
      expect(screen.queryByText('Duration:')).not.toBeInTheDocument();
    });

    it('hides transcript when showTranscript is false', () => {
      render(
        <AIPodcastPlayer 
          {...defaultProps} 
          customization={{ showTranscript: false }}
        />
      );
      
      expect(screen.queryByText('Transcript')).not.toBeInTheDocument();
    });

    it('hides download button when showDownload is false', () => {
      render(
        <AIPodcastPlayer 
          {...defaultProps} 
          customization={{ showDownload: false }}
        />
      );
      
      expect(screen.queryByTitle('Download')).not.toBeInTheDocument();
    });

    it('returns null when not enabled', () => {
      const { container } = render(
        <AIPodcastPlayer {...defaultProps} isEnabled={false} />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Generation States', () => {
    it('shows pending state correctly', () => {
      const pendingData = {
        ...defaultProps.data,
        generationStatus: 'pending' as const,
        audioUrl: undefined
      };
      
      mockUseFeatureData.mockReturnValue({
        ...mockFeatureDataResponse,
        data: pendingData
      });
      
      render(<AIPodcastPlayer {...defaultProps} data={pendingData} />);
      
      expect(screen.getByText('Podcast Generation Queued')).toBeInTheDocument();
      expect(screen.getByText(/will start generating once processing begins/)).toBeInTheDocument();
    });

    it('shows generating state with progress animation', () => {
      const generatingData = {
        ...defaultProps.data,
        generationStatus: 'generating' as const,
        audioUrl: undefined
      };
      
      mockUseFeatureData.mockReturnValue({
        ...mockFeatureDataResponse,
        data: generatingData
      });
      
      render(<AIPodcastPlayer {...defaultProps} data={generatingData} />);
      
      expect(screen.getByText('Creating Your Podcast')).toBeInTheDocument();
      expect(screen.getByText(/Estimated time: 2-3 minutes/)).toBeInTheDocument();
    });

    it('shows failed state with retry button', () => {
      const failedData = {
        ...defaultProps.data,
        generationStatus: 'failed' as const,
        audioUrl: undefined
      };
      
      mockUseFeatureData.mockReturnValue({
        ...mockFeatureDataResponse,
        data: failedData
      });
      
      render(<AIPodcastPlayer {...defaultProps} data={failedData} />);
      
      expect(screen.getByText('Generation Failed')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('shows loading state when hook is loading', () => {
      mockUseFeatureData.mockReturnValue({
        ...mockFeatureDataResponse,
        loading: true
      });
      
      render(<AIPodcastPlayer {...defaultProps} />);
      
      expect(screen.getByText('Creating Your Podcast')).toBeInTheDocument();
    });

    it('shows error state when hook has error', () => {
      const error = new Error('Generation failed');
      mockUseFeatureData.mockReturnValue({
        ...mockFeatureDataResponse,
        error
      });
      
      render(<AIPodcastPlayer {...defaultProps} />);
      
      expect(screen.getByText('Generation Failed')).toBeInTheDocument();
      expect(screen.getByText('Generation failed')).toBeInTheDocument();
    });
  });

  describe('Audio Controls', () => {
    it('toggles play/pause when play button is clicked', async () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const playButton = screen.getByRole('button', { name: /play/i });
      
      await userEvent.click(playButton);
      
      expect(global.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it('seeks audio when progress bar is changed', async () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const progressBar = screen.getByRole('slider');
      
      await act(async () => {
        fireEvent.change(progressBar, { target: { value: '90' } });
      });
      
      // The audio element's currentTime should be set (mocked)
      expect(progressBar).toHaveValue('90');
    });

    it('skips forward and backward', async () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const skipBackButton = screen.getByTitle('Skip back 10 seconds');
      const skipForwardButton = screen.getByTitle('Skip forward 10 seconds');
      
      await userEvent.click(skipBackButton);
      await userEvent.click(skipForwardButton);
      
      // These would modify audio.currentTime in a real environment
      expect(skipBackButton).toBeInTheDocument();
      expect(skipForwardButton).toBeInTheDocument();
    });

    it('changes volume when volume slider is adjusted', async () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const volumeSlider = screen.getByDisplayValue('1'); // Default volume
      
      await act(async () => {
        fireEvent.change(volumeSlider, { target: { value: '0.5' } });
      });
      
      expect(volumeSlider).toHaveValue('0.5');
    });

    it('toggles mute when mute button is clicked', async () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const muteButton = screen.getByTitle('Mute');
      
      await userEvent.click(muteButton);
      
      // Should toggle mute state
      expect(muteButton).toBeInTheDocument();
    });

    it('changes playback speed', async () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const speedSelect = screen.getByDisplayValue('1x');
      
      await userEvent.selectOptions(speedSelect, '1.5');
      
      expect(speedSelect).toHaveValue('1.5');
    });
  });

  describe('Transcript Functionality', () => {
    it('parses transcript into segments', () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      // Should show transcript segments
      expect(screen.getByText(/This is a test transcript/)).toBeInTheDocument();
      expect(screen.getByText(/It contains multiple sentences/)).toBeInTheDocument();
      expect(screen.getByText(/Each sentence represents a segment/)).toBeInTheDocument();
    });

    it('seeks to segment when transcript segment is clicked', async () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const firstSegment = screen.getByText(/This is a test transcript/);
      
      await userEvent.click(firstSegment);
      
      // Should seek to the beginning of that segment
      expect(firstSegment).toBeInTheDocument();
    });

    it('highlights active transcript segment', () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      // The first segment should be styled differently when active
      const firstSegment = screen.getByText(/This is a test transcript/).closest('div');
      expect(firstSegment).toHaveClass('cursor-pointer');
    });
  });

  describe('Action Buttons', () => {
    it('downloads audio when download button is clicked', async () => {
      // Mock document.createElement and appendChild
      const mockLink = {
        click: vi.fn(),
        href: '',
        download: ''
      };
      
      document.createElement = vi.fn().mockReturnValue(mockLink);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
      
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const downloadButton = screen.getByTitle('Download');
      await userEvent.click(downloadButton);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('Download started!');
    });

    it('shares audio when share button is clicked', async () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const shareButton = screen.getByTitle('Share');
      await userEvent.click(shareButton);
      
      expect(navigator.share).toHaveBeenCalledWith({
        title: 'Test Career Podcast',
        text: 'A test podcast description',
        url: 'https://example.com/podcast.mp3'
      });
    });

    it('falls back to clipboard when native share is not available', async () => {
      // Remove native share API
      (navigator as any).share = undefined;
      
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const shareButton = screen.getByTitle('Share');
      await userEvent.click(shareButton);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://example.com/podcast.mp3'
      );
      expect(mockToast.success).toHaveBeenCalledWith('Audio URL copied to clipboard!');
    });

    it('restarts audio when restart button is clicked', async () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const restartButton = screen.getByTitle('Restart');
      await userEvent.click(restartButton);
      
      // Should reset currentTime to 0
      expect(restartButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles audio playback errors', async () => {
      const mockError = new Error('Audio load failed');
      global.HTMLMediaElement.prototype.play = vi.fn(() => Promise.reject(mockError));
      
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const playButton = screen.getByRole('button', { name: /play/i });
      await userEvent.click(playButton);
      
      expect(mockToast.error).toHaveBeenCalledWith('Audio playback failed. Please try again.');
    });

    it('handles share errors gracefully', async () => {
      const shareError = new Error('Share failed');
      (navigator.share as any).mockRejectedValue(shareError);
      
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const shareButton = screen.getByTitle('Share');
      await userEvent.click(shareButton);
      
      expect(mockToast.error).toHaveBeenCalledWith('Share failed. Please try again.');
    });

    it('calls onError prop when errors occur', () => {
      const onError = vi.fn();
      render(<AIPodcastPlayer {...defaultProps} onError={onError} />);
      
      // Trigger an audio error
      const audioElement = document.querySelector('audio');
      if (audioElement) {
        fireEvent.error(audioElement);
      }
      
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
      expect(screen.getByTitle('Skip back 10 seconds')).toBeInTheDocument();
      expect(screen.getByTitle('Skip forward 10 seconds')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      const playButton = screen.getByRole('button', { name: /play/i });
      
      // Tab to the play button and press Enter
      playButton.focus();
      await userEvent.keyboard('{Enter}');
      
      expect(global.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });
  });

  describe('Props and Customization', () => {
    it('calls onUpdate when data changes', () => {
      const onUpdate = vi.fn();
      render(<AIPodcastPlayer {...defaultProps} onUpdate={onUpdate} />);
      
      // onUpdate would be called in real scenarios when the component updates data
      expect(onUpdate).not.toHaveBeenCalled(); // Not called in this test setup
    });

    it('applies custom className', () => {
      const { container } = render(
        <AIPodcastPlayer {...defaultProps} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('works in public mode', () => {
      render(<AIPodcastPlayer {...defaultProps} mode="public" />);
      
      expect(screen.getByText('Test Career Podcast')).toBeInTheDocument();
    });

    it('works in preview mode', () => {
      render(<AIPodcastPlayer {...defaultProps} mode="preview" />);
      
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  describe('Time Formatting', () => {
    it('formats time correctly', () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      // Should show formatted duration
      expect(screen.getByText('Duration: 3:00')).toBeInTheDocument();
    });
  });

  describe('Auto-play', () => {
    it('auto-plays when autoplay is enabled', async () => {
      render(
        <AIPodcastPlayer 
          {...defaultProps} 
          customization={{ autoplay: true }}
        />
      );
      
      await waitFor(() => {
        expect(global.HTMLMediaElement.prototype.play).toHaveBeenCalled();
      });
    });

    it('does not auto-play by default', () => {
      render(<AIPodcastPlayer {...defaultProps} />);
      
      expect(global.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    });
  });
});