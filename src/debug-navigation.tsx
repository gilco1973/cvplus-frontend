/**
 * Debug Navigation Issue
 * This component helps debug the navigation issue between RoleSelectionPage and FeatureSelectionPage
 */

import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export const NavigationDebugger: React.FC = () => {
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    console.log('🔍 Navigation Debug Info:');
    console.log('- Current pathname:', location.pathname);
    console.log('- Current params:', params);
    console.log('- Location state:', location.state);
    console.log('- URL:', window.location.href);
    
    // Check if we're on the expected route
    const isFeatureSelection = location.pathname.includes('customize') || location.pathname.includes('select-features');
    const isResults = location.pathname.includes('results');
    
    console.log('🎯 Route Analysis:');
    console.log('- Is Feature Selection route:', isFeatureSelection);
    console.log('- Is Results route:', isResults);
    console.log('- Expected: Feature Selection route (customize or select-features)');
    
    if (isResults && !isFeatureSelection) {
      console.error('❌ NAVIGATION BUG: Currently on Results route but expected Feature Selection!');
    }
    
    // Check what component is actually rendering
    const pageTitle = document.querySelector('h1')?.textContent;
    console.log('- Page Title in DOM:', pageTitle);
    
    if (pageTitle === 'Your Enhanced CV is Ready!' && isFeatureSelection) {
      console.error('❌ COMPONENT BUG: FeatureSelectionPage route showing ResultsPage content!');
    }
  }, [location, params]);

  return (
    <div className="fixed top-4 right-4 bg-red-900 text-white p-4 rounded max-w-md text-sm z-50">
      <h3 className="font-bold mb-2">Navigation Debug</h3>
      <p>Path: {location.pathname}</p>
      <p>Params: {JSON.stringify(params)}</p>
      <p>Expected: Feature Selection Page</p>
    </div>
  );
};