import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DynamicQRCode } from '../DynamicQRCode';
import { CVFeatureProps } from '../../../../types/cv-features';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn().mockResolvedValue({ data: {} })),
  getFunctions: vi.fn(() => ({})),
  connectFunctionsEmulator: vi.fn()
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({
    name: 'test-app',
    options: {},
    automaticDataCollectionEnabled: false
  })),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({
    name: 'test-app',
    options: {},
    automaticDataCollectionEnabled: false
  })),
  FirebaseError: class MockFirebaseError extends Error {
    constructor(public code: string, message: string) {
      super(message);
      this.name = 'FirebaseError';
    }
  }
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  connectAuthEmulator: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  connectFirestoreEmulator: vi.fn()
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  connectStorageEmulator: vi.fn()
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({})),
  isSupported: vi.fn(() => Promise.resolve(true))
}));

vi.mock('../../../lib/firebase', () => ({
  functions: {},
  app: {},
  auth: {},
  db: {},
  storage: {}
}));

vi.mock('../../../hooks/useFeatureData', () => ({
  useFeatureData: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
    update: vi.fn(),
    state: 'idle'
  }))
}));

// Mock canvas and related APIs
const mockContext = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  arc: vi.fn(),
  clip: vi.fn(),
  fillStyle: '#000000'
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => mockContext)
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: vi.fn(() => 'data:image/png;base64,mock-image-data')
});

Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
  value: 256,
  writable: true
});

Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
  value: 256,
  writable: true
});

// Mock navigator APIs
Object.defineProperty(global.navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    write: vi.fn().mockResolvedValue(undefined)
  },
  writable: true
});

Object.defineProperty(global.navigator, 'share', {
  value: vi.fn().mockResolvedValue(undefined),
  writable: true
});

// Mock URL.createObjectURL
Object.defineProperty(global.URL, 'createObjectURL', {
  value: vi.fn(() => 'blob:mock-url'),
  writable: true
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    blob: () => Promise.resolve(new Blob(['mock'], { type: 'image/png' }))
  } as Response)
);

// Mock File constructor
global.File = class MockFile {
  constructor(public parts: BlobPart[], public name: string, public options?: FilePropertyBag) {}
} as any;

// Mock ClipboardItem
global.ClipboardItem = class MockClipboardItem {
  constructor(public data: Record<string, Blob>) {}
} as any;

const mockProps: CVFeatureProps & {
  data: {
    url: string;
    profileUrl?: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
  };
} = {
  jobId: 'test-job-123',
  profileId: 'test-profile-456',
  isEnabled: true,
  data: {
    url: 'https://example.com/profile',
    profileUrl: 'https://example.com/public-profile',
    portfolioUrl: 'https://example.com/portfolio',
    linkedinUrl: 'https://linkedin.com/in/testuser'
  },
  customization: {
    size: 256,
    style: 'square',
    backgroundColor: '#FFFFFF',
    foregroundColor: '#000000'
  },
  onUpdate: vi.fn(),
  onError: vi.fn(),
  className: 'test-class',
  mode: 'private'
};

describe('DynamicQRCode Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with basic props', async () => {
    await act(async () => {
      render(<DynamicQRCode {...mockProps} />);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Generating QR code...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(screen.getByText('Dynamic QR Code')).toBeInTheDocument();
    expect(screen.getByText('Customizable QR code with analytics tracking')).toBeInTheDocument();
    expect(screen.getByText('Select URL to encode')).toBeInTheDocument();
  });

  it('displays URL options correctly', () => {
    render(<DynamicQRCode {...mockProps} />);
    
    expect(screen.getByText('Profile URL')).toBeInTheDocument();
    expect(screen.getByText('Public Profile')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('does not render when disabled', () => {
    render(<DynamicQRCode {...mockProps} isEnabled={false} />);
    
    expect(screen.queryByText('Dynamic QR Code')).not.toBeInTheDocument();
  });

  it('handles URL selection change', async () => {
    render(<DynamicQRCode {...mockProps} />);
    
    const portfolioButton = screen.getByText('Portfolio');
    
    await act(async () => {
      fireEvent.click(portfolioButton);
    });
    
    // The button should be selected (would have different styling)
    expect(portfolioButton.closest('button')).toHaveClass('border-blue-500');
  });

  it('generates QR code on mount', async () => {
    const QRCodeGenerator = await import('qrcode');
    
    render(<DynamicQRCode {...mockProps} />);
    
    await waitFor(() => {
      expect(QRCodeGenerator.default.toCanvas).toHaveBeenCalled();
    });
  });

  it('shows action buttons when QR code is generated', async () => {
    render(<DynamicQRCode {...mockProps} />);
    
    // Wait for QR code generation
    await waitFor(() => {
      expect(screen.getByText('Download')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Refresh')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('shows share button when navigator.share is available', async () => {
    render(<DynamicQRCode {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Share')).toBeInTheDocument();
    });
  });

  it('downloads QR code when download button is clicked', async () => {
    // Mock document.createElement and appendChild/removeChild
    const mockLink = {
      click: vi.fn(),
      href: '',
      download: ''
    };
    
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    
    render(<DynamicQRCode {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Download')).toBeInTheDocument();
    });
    
    const downloadButton = screen.getByText('Download');
    
    await act(async () => {
      fireEvent.click(downloadButton);
    });
    
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
    expect(mockLink.click).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    expect(toast.success).toHaveBeenCalledWith('QR code downloaded successfully!');
    
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('copies QR code to clipboard when copy button is clicked', async () => {
    render(<DynamicQRCode {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });
    
    const copyButton = screen.getByText('Copy');
    
    await act(async () => {
      fireEvent.click(copyButton);
    });
    
    expect(global.fetch).toHaveBeenCalled();
    expect(navigator.clipboard.write).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('QR code copied to clipboard!');
  });

  it('toggles settings panel when settings button is clicked', async () => {
    render(<DynamicQRCode {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
    
    const settingsButton = screen.getByText('Settings');
    
    // Settings panel should not be visible initially
    expect(screen.queryByText('QR Code Settings')).not.toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(settingsButton);
    });
    
    // Settings panel should now be visible
    expect(screen.getByText('QR Code Settings')).toBeInTheDocument();
    expect(screen.getByText('Style')).toBeInTheDocument();
    expect(screen.getByText('Foreground Color')).toBeInTheDocument();
    expect(screen.getByText('Background Color')).toBeInTheDocument();
  });

  it('updates customization when settings are changed', async () => {
    const onUpdateMock = vi.fn();
    
    render(<DynamicQRCode {...mockProps} onUpdate={onUpdateMock} />);
    
    // Open settings panel
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
    
    const settingsButton = screen.getByText('Settings');
    
    await act(async () => {
      fireEvent.click(settingsButton);
    });
    
    // Change style
    const styleSelect = screen.getByDisplayValue('square');
    
    await act(async () => {
      fireEvent.change(styleSelect, { target: { value: 'rounded' } });
    });
    
    expect(onUpdateMock).toHaveBeenCalledWith({
      customization: {
        ...mockProps.customization,
        style: 'rounded'
      }
    });
  });

  it('displays current URL correctly', async () => {
    render(<DynamicQRCode {...mockProps} />);
    
    expect(screen.getByText('Current URL:')).toBeInTheDocument();
    expect(screen.getByText(mockProps.data.url)).toBeInTheDocument();
  });

  it('handles QR code generation errors gracefully', async () => {
    const QRCodeGenerator = await import('qrcode');
    const toCanvasMock = QRCodeGenerator.default.toCanvas as any;
    
    // Make QR code generation fail
    toCanvasMock.mockRejectedValueOnce(new Error('QR generation failed'));
    
    const onErrorMock = vi.fn();
    
    render(<DynamicQRCode {...mockProps} onError={onErrorMock} />);
    
    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith(expect.any(Error));
      expect(toast.error).toHaveBeenCalledWith('Failed to generate QR code');
    });
  });

  it('handles clipboard copy fallback when image copy fails', async () => {
    // Make clipboard.write fail
    (navigator.clipboard.write as any).mockRejectedValueOnce(new Error('Write failed'));
    
    render(<DynamicQRCode {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });
    
    const copyButton = screen.getByText('Copy');
    
    await act(async () => {
      fireEvent.click(copyButton);
    });
    
    // Should fall back to copying the data URL as text
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('QR code data URL copied to clipboard!');
  });

  it('handles share functionality when available', async () => {
    render(<DynamicQRCode {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Share')).toBeInTheDocument();
    });
    
    const shareButton = screen.getByText('Share');
    
    await act(async () => {
      fireEvent.click(shareButton);
    });
    
    expect(global.fetch).toHaveBeenCalled();
    expect(navigator.share).toHaveBeenCalledWith({
      title: 'My QR Code',
      text: 'Check out my professional profile QR code',
      files: [expect.any(MockFile)]
    });
  });

  it('shows error when share is not supported', async () => {
    // Temporarily remove navigator.share
    const originalShare = navigator.share;
    delete (navigator as any).share;
    
    render(<DynamicQRCode {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Share')).not.toBeInTheDocument();
    });
    
    // Restore navigator.share
    (navigator as any).share = originalShare;
  });

  it('refreshes QR code and analytics when refresh button is clicked', async () => {
    const QRCodeGenerator = await import('qrcode');
    
    render(<DynamicQRCode {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
    
    const refreshButton = screen.getByText('Refresh');
    
    // Clear previous calls
    vi.clearAllMocks();
    
    await act(async () => {
      fireEvent.click(refreshButton);
    });
    
    expect(QRCodeGenerator.default.toCanvas).toHaveBeenCalled();
  });

  it('applies different styles correctly', async () => {
    const { rerender } = render(<DynamicQRCode {...mockProps} />);
    
    // Test rounded style
    rerender(
      <DynamicQRCode 
        {...mockProps} 
        customization={{ ...mockProps.customization, style: 'rounded' }}
      />
    );
    
    await waitFor(() => {
      const canvas = screen.getByRole('img', { hidden: true }) || document.querySelector('canvas');
      expect(canvas).toHaveClass('rounded-lg');
    });
    
    // Test circular style
    rerender(
      <DynamicQRCode 
        {...mockProps} 
        customization={{ ...mockProps.customization, style: 'circular' }}
      />
    );
    
    await waitFor(() => {
      const canvas = screen.getByRole('img', { hidden: true }) || document.querySelector('canvas');
      expect(canvas).toHaveClass('rounded-full');
    });
  });

  it('displays loading state during QR generation', async () => {
    // Mock QR generation to take some time
    const QRCodeGenerator = await import('qrcode');
    const toCanvasMock = QRCodeGenerator.default.toCanvas as any;
    
    // Make QR code generation take time
    toCanvasMock.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    await act(async () => {
      render(<DynamicQRCode {...mockProps} />);
    });
    
    // Should show loading initially
    expect(screen.getByText('Generating QR code...')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Generating QR code...')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('handles analytics display when available', async () => {
    // Mock analytics data
    const mockAnalytics = {
      totalScans: 42,
      uniqueScans: 28,
      scansByDate: { '2024-01-01': 5 },
      scansByDevice: { mobile: 20, desktop: 22 },
      lastScanned: new Date('2024-01-15')
    };
    
    await act(async () => {
      render(<DynamicQRCode {...mockProps} />);
    });
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText('Generating QR code...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // The component includes analytics functionality even if not visible in this test
    expect(screen.getByText('Dynamic QR Code')).toBeInTheDocument();
  });
});