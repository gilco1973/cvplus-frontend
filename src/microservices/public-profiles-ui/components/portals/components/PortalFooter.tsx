import React from 'react';
import { PortalConfig } from '../../../../types/portal-types';

interface PortalFooterProps {
  portalConfig: PortalConfig;
  layoutConfig?: any;
  themeClasses: {
    background: string;
    text: string;
    secondary: string;
    border: string;
    card: string;
  };
}

export const PortalFooter: React.FC<PortalFooterProps> = ({
  portalConfig,
  layoutConfig,
  themeClasses
}) => {
  if (layoutConfig?.footer?.show === false) return null;
  
  return (
    <footer className={`${themeClasses.card} ${themeClasses.border} border-t mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {layoutConfig?.footer?.showBranding !== false && (
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${themeClasses.secondary}`}>Powered by</span>
              <span className="text-sm font-semibold text-blue-600">CVPlus</span>
            </div>
          )}
          
          {layoutConfig?.footer?.content && (
            <div>{layoutConfig.footer.content}</div>
          )}
          
          <div className={`text-sm ${themeClasses.secondary}`}>
            © {new Date().getFullYear()} {portalConfig.name}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};