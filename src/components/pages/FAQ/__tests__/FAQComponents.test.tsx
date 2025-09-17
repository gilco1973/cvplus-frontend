import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import { FAQPage } from '../FAQPage';
import { FAQSearchBar } from '../FAQSearchBar';
import { FAQCategoryGrid } from '../FAQCategoryGrid';
import { FAQAccordion } from '../FAQAccordion';
import { FAQFeedbackButtons } from '../FAQFeedbackButtons';
import { FAQItem, FAQCategory } from '../types';

// Mock data for testing
const mockFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I upload my CV?',
    answer: 'You can upload your CV by dragging and dropping the file or clicking browse.',
    category: 'getting-started',
    tags: ['upload', 'CV'],
    priority: 'high',
    lastUpdated: '2024-01-15',
    helpfulCount: 10
  },
  {
    id: '2',
    question: 'What formats are supported?',
    answer: 'We support PDF, Word, and text formats.',
    category: 'getting-started',
    tags: ['formats', 'file types'],
    priority: 'medium',
    lastUpdated: '2024-01-10',
    helpfulCount: 5
  }
];

const mockCategories: FAQCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Basic setup and usage',
    icon: 'zap',
    color: '#06b6d4',
    count: 2
  }
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('FAQ Components', () => {
  describe('FAQSearchBar', () => {
    test('renders search input', () => {
      const mockOnQueryChange = jest.fn();
      render(
        <FAQSearchBar
          query=""
          onQueryChange={mockOnQueryChange}
          placeholder="Search FAQs"
        />
      );

      const searchInput = screen.getByPlaceholderText('Search FAQs');
      expect(searchInput).toBeInTheDocument();
    });

    test('calls onQueryChange when typing', () => {
      const mockOnQueryChange = jest.fn();
      render(
        <FAQSearchBar
          query=""
          onQueryChange={mockOnQueryChange}
        />
      );

      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      expect(mockOnQueryChange).toHaveBeenCalledWith('test query');
    });
  });

  describe('FAQCategoryGrid', () => {
    test('renders categories', () => {
      const mockOnCategorySelect = jest.fn();
      render(
        <FAQCategoryGrid
          categories={mockCategories}
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
        />
      );

      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.getByText('Basic setup and usage')).toBeInTheDocument();
    });

    test('handles category selection', () => {
      const mockOnCategorySelect = jest.fn();
      render(
        <FAQCategoryGrid
          categories={mockCategories}
          selectedCategory="all"
          onCategorySelect={mockOnCategorySelect}
        />
      );

      const categoryButton = screen.getByText('Getting Started').closest('button');
      if (categoryButton) {
        fireEvent.click(categoryButton);
        expect(mockOnCategorySelect).toHaveBeenCalledWith('getting-started');
      }
    });
  });

  describe('FAQAccordion', () => {
    test('renders FAQ items', () => {
      const mockOnFeedback = jest.fn();
      render(
        <FAQAccordion
          faqs={mockFAQs}
          searchQuery=""
          selectedCategory="all"
          onFeedback={mockOnFeedback}
        />
      );

      expect(screen.getByText('How do I upload my CV?')).toBeInTheDocument();
      expect(screen.getByText('What formats are supported?')).toBeInTheDocument();
    });

    test('expands FAQ item when clicked', () => {
      const mockOnFeedback = jest.fn();
      render(
        <FAQAccordion
          faqs={mockFAQs}
          searchQuery=""
          selectedCategory="all"
          onFeedback={mockOnFeedback}
        />
      );

      const faqButton = screen.getByText('How do I upload my CV?').closest('button');
      if (faqButton) {
        fireEvent.click(faqButton);
        expect(screen.getByText(/You can upload your CV by dragging/)).toBeInTheDocument();
      }
    });

    test('filters FAQs by search query', () => {
      const mockOnFeedback = jest.fn();
      render(
        <FAQAccordion
          faqs={mockFAQs}
          searchQuery="upload"
          selectedCategory="all"
          onFeedback={mockOnFeedback}
        />
      );

      expect(screen.getByText('How do I upload my CV?')).toBeInTheDocument();
      expect(screen.queryByText('What formats are supported?')).not.toBeInTheDocument();
    });

    test('filters FAQs by category', () => {
      const mockOnFeedback = jest.fn();
      const faqsWithDifferentCategory = [
        ...mockFAQs,
        {
          id: '3',
          question: 'How much does it cost?',
          answer: 'Pricing starts at $19/month.',
          category: 'pricing',
          tags: ['pricing', 'cost'],
          priority: 'medium' as const,
          lastUpdated: '2024-01-05',
          helpfulCount: 8
        }
      ];
      
      render(
        <FAQAccordion
          faqs={faqsWithDifferentCategory}
          searchQuery=""
          selectedCategory="getting-started"
          onFeedback={mockOnFeedback}
        />
      );

      expect(screen.getByText('How do I upload my CV?')).toBeInTheDocument();
      expect(screen.getByText('What formats are supported?')).toBeInTheDocument();
      expect(screen.queryByText('How much does it cost?')).not.toBeInTheDocument();
    });
  });

  describe('FAQFeedbackButtons', () => {
    test('renders feedback buttons', () => {
      const mockOnFeedback = jest.fn();
      render(
        <FAQFeedbackButtons
          faqId="test-id"
          onFeedback={mockOnFeedback}
        />
      );

      expect(screen.getByText('Was this helpful?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /thumbs up/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /thumbs down/i })).toBeInTheDocument();
    });

    test('handles positive feedback', () => {
      const mockOnFeedback = jest.fn();
      render(
        <FAQFeedbackButtons
          faqId="test-id"
          onFeedback={mockOnFeedback}
        />
      );

      const thumbsUpButton = screen.getByRole('button', { name: /thumbs up/i });
      fireEvent.click(thumbsUpButton);
      expect(mockOnFeedback).toHaveBeenCalledWith('test-id', true);
    });

    test('handles negative feedback', () => {
      const mockOnFeedback = jest.fn();
      render(
        <FAQFeedbackButtons
          faqId="test-id"
          onFeedback={mockOnFeedback}
        />
      );

      const thumbsDownButton = screen.getByRole('button', { name: /thumbs down/i });
      fireEvent.click(thumbsDownButton);
      expect(mockOnFeedback).toHaveBeenCalledWith('test-id', false);
    });
  });

  describe('FAQPage', () => {
    test('renders main FAQ page', () => {
      renderWithRouter(<FAQPage />);
      
      expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
      expect(screen.getByText(/search for answers/i)).toBeInTheDocument();
    });

    test('renders with initial category', () => {
      renderWithRouter(<FAQPage initialCategory="getting-started" />);
      
      expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
    });

    test('renders with initial query', () => {
      renderWithRouter(<FAQPage initialQuery="upload" />);
      
      expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
    });
  });
});
