/**
 * Pagination component for the logs viewer
 * Handles page navigation and displays current page information
 */

import React from 'react';

interface LogsPaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export const LogsPagination: React.FC<LogsPaginationProps> = ({
  currentPage,
  totalCount,
  pageSize,
  loading,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalCount.toLocaleString()} logs
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage <= 1 || loading}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-white"
          >
            Previous
          </button>

          <span className="px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages || loading}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};