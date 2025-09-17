import React from 'react';
import { RoleDetectionPremiumGate } from './RoleDetectionPremiumGate';
import { RoleProfileIntegration, RoleProfileIntegrationProps } from '../RoleProfileIntegration';

/**
 * Premium Gate for RoleProfileIntegration Component
 * Wraps the RoleProfileIntegration with premium access control
 */
export const RoleProfileIntegrationPremiumGate: React.FC<RoleProfileIntegrationProps> = (props) => {
  return (
    <RoleDetectionPremiumGate>
      <RoleProfileIntegration {...props} />
    </RoleDetectionPremiumGate>
  );
};

export default RoleProfileIntegrationPremiumGate;