import React from 'react';
import { RoleDetectionPremiumGate } from './RoleDetectionPremiumGate';
import { RoleProfileSelector, RoleProfileSelectorProps } from '../RoleProfileSelector';

/**
 * Premium Gate for RoleProfileSelector Component
 * Wraps the RoleProfileSelector with premium access control
 */
export const RoleProfileSelectorPremiumGate: React.FC<RoleProfileSelectorProps> = (props) => {
  return (
    <RoleDetectionPremiumGate>
      <RoleProfileSelector {...props} />
    </RoleDetectionPremiumGate>
  );
};

export default RoleProfileSelectorPremiumGate;