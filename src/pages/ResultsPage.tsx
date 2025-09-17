/**
 * Results Page - Now displays actual results (fixed architectural mismatch)
 * Previously this was a feature selection page, now it properly shows CV results
 */

import React from 'react';
import { FinalResultsPage } from './FinalResultsPage';

/**
 * ARCHITECTURAL FIX: This page was previously misnamed - it showed feature selection
 * instead of results. Now it properly displays actual results by delegating to FinalResultsPage.
 * This fixes the critical user confusion where /results/:jobId showed feature selection.
 */
export const ResultsPage = () => {
  // Delegate to FinalResultsPage to show actual results
  return <FinalResultsPage />;
};