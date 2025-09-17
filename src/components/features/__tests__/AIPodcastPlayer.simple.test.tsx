import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { AIPodcastPlayer } from '../AI-Powered/AIPodcastPlayer';
import { PodcastData } from '../../../types/cv-features';

// Mock the useFeatureData hook
const mockUseFeatureData = vi.fn();
vi.mock('../../../hooks/useFeatureData', () => ({
  useFeatureData: () => mockUseFeatureData()
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}));

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock useFeatureData hook
  mockUseFeatureData.mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn()
  });
  
  // Mock audio API
  global.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
  global.HTMLMediaElement.prototype.pause = vi.fn();
  global.HTMLMediaElement.prototype.load = vi.fn();
  
  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
});

const defaultProps = {
  jobId: 'test-job-123',
  profileId: 'test-profile-456',
  data: {
    audioUrl: 'https://example.com/podcast.mp3',
    transcript: 'This is a test transcript.',
    duration: 180,
    title: 'Test Career Podcast',
    description: 'A test podcast description',
    generationStatus: 'completed' as const
  } as PodcastData
};

describe('AIPodcastPlayer - Basic Functionality', () => {
  it('renders without crashing', () => {
    const { container } = render(<AIPodcastPlayer {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  it('shows pending state when data is pending', () => {
    const pendingData = {
      ...defaultProps.data,
      generationStatus: 'pending' as const,
      audioUrl: undefined
    };
    
    render(<AIPodcastPlayer {...defaultProps} data={pendingData} />);
    
    expect(screen.getByText('Podcast Generation Queued')).toBeInTheDocument();
  });

  it('shows generating state when status is generating', () => {
    const generatingData = {
      ...defaultProps.data,
      generationStatus: 'generating' as const,
      audioUrl: undefined
    };
    
    render(<AIPodcastPlayer {...defaultProps} data={generatingData} />);
    
    expect(screen.getByText('Creating Your Podcast')).toBeInTheDocument();
  });

  it('shows failed state when generation fails', () => {
    const failedData = {
      ...defaultProps.data,
      generationStatus: 'failed' as const,
      audioUrl: undefined
    };
    
    render(<AIPodcastPlayer {...defaultProps} data={failedData} />);
    
    expect(screen.getByText('Generation Failed')).toBeInTheDocument();
  });

  it('shows no audio message when audioUrl is missing', () => {
    const noAudioData = {
      ...defaultProps.data,
      audioUrl: undefined
    };
    
    render(<AIPodcastPlayer {...defaultProps} data={noAudioData} />);
    
    expect(screen.getByText('No Podcast Available')).toBeInTheDocument();
  });

  it('returns null when disabled', () => {
    const { container } = render(
      <AIPodcastPlayer {...defaultProps} isEnabled={false} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders audio controls when podcast is completed', () => {
    render(<AIPodcastPlayer {...defaultProps} />);
    
    // Should have a play button
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    
    // Should have an audio element
    const audioElement = document.querySelector('audio');
    expect(audioElement).toBeInTheDocument();
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

  it('shows transcript when showTranscript is true', () => {
    render(
      <AIPodcastPlayer 
        {...defaultProps} 
        customization={{ showTranscript: true }}
      />
    );
    
    expect(screen.getByText('Transcript')).toBeInTheDocument();
    expect(screen.getByText('This is a test transcript.')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AIPodcastPlayer {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays podcast title and description', () => {
    render(<AIPodcastPlayer {...defaultProps} />);
    
    expect(screen.getByText('Test Career Podcast')).toBeInTheDocument();
    expect(screen.getByText('A test podcast description')).toBeInTheDocument();
  });

  it('formats duration correctly', () => {
    render(<AIPodcastPlayer {...defaultProps} />);
    
    expect(screen.getByText('Duration: 3:00')).toBeInTheDocument();
  });

  it('renders with minimal theme', () => {
    render(
      <AIPodcastPlayer 
        {...defaultProps} 
        customization={{ theme: 'minimal' }}
      />
    );
    
    // In minimal theme, duration should not be shown
    expect(screen.queryByText('Duration:')).not.toBeInTheDocument();
  });

  it('shows preview badge in preview mode', () => {
    render(<AIPodcastPlayer {...defaultProps} mode="preview" />);
    
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });
});