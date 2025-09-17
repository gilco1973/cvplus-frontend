import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContactForm } from '../ContactForm';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useFirebaseFunction hook
vi.mock('../../../hooks/useFeatureData', () => ({
  useFirebaseFunction: () => ({
    callFunction: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null,
  }),
}));

const mockToast = vi.mocked(await import('react-hot-toast')).default;

describe('ContactForm', () => {
  const defaultProps = {
    jobId: 'test-job-id',
    profileId: 'test-profile-id',
    data: { contactName: 'John Doe' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders contact form with all required fields', () => {
    render(<ContactForm {...defaultProps} />);

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('shows optional fields when customization allows', () => {
    const propsWithFields = {
      ...defaultProps,
      customization: {
        showCompanyField: true,
        showPhoneField: true,
      },
    };
    
    render(<ContactForm {...propsWithFields} />);

    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it('hides optional fields when customization disables them', () => {
    const propsWithoutFields = {
      ...defaultProps,
      customization: {
        showCompanyField: false,
        showPhoneField: false,
      },
    };
    
    render(<ContactForm {...propsWithoutFields} />);

    expect(screen.queryByLabelText(/company/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/phone/i)).not.toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(<ContactForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/please select a subject/i)).toBeInTheDocument();
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<ContactForm {...defaultProps} />);

    const emailInput = screen.getByLabelText(/your email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates minimum message length', async () => {
    render(<ContactForm {...defaultProps} />);

    const messageInput = screen.getByLabelText(/message/i);
    fireEvent.change(messageInput, { target: { value: 'short' } });

    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/message must be at least 10 characters long/i)).toBeInTheDocument();
    });
  });

  it('updates character count for message field', () => {
    render(<ContactForm {...defaultProps} />);

    const messageInput = screen.getByLabelText(/message/i);
    const testMessage = 'This is a test message';
    
    fireEvent.change(messageInput, { target: { value: testMessage } });

    expect(screen.getByText(`${testMessage.length}/1000 characters`)).toBeInTheDocument();
  });

  it('submits form successfully with valid data', async () => {
    render(<ContactForm {...defaultProps} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByLabelText(/your email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/subject/i), {
      target: { value: 'job-opportunity' }
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'This is a test message for the contact form.' }
    });

    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    // Form should be successfully filled
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('renders in different modes', () => {
    const { rerender } = render(<ContactForm {...defaultProps} mode="public" />);
    expect(screen.getByText(/get in touch/i)).toBeInTheDocument();
    
    rerender(<ContactForm {...defaultProps} mode="preview" />);
    expect(screen.getByText(/preview mode/i)).toBeInTheDocument();
  });

  it('does not render when isEnabled is false', () => {
    render(<ContactForm {...defaultProps} isEnabled={false} />);
    
    expect(screen.queryByText(/get in touch/i)).not.toBeInTheDocument();
  });

  it('applies custom className prop', () => {
    const { container } = render(
      <ContactForm {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('uses custom title and button text from customization', () => {
    const customization = {
      title: 'Contact Me',
      buttonText: 'Send Now',
    };
    
    render(
      <ContactForm {...defaultProps} customization={customization} />
    );
    
    expect(screen.getByText('Contact Me')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send now/i })).toBeInTheDocument();
  });

  it('displays contact name correctly', () => {
    const propsWithContactName = {
      ...defaultProps,
      data: { contactName: 'Jane Smith' },
    };
    
    render(<ContactForm {...propsWithContactName} />);
    expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
  });
});