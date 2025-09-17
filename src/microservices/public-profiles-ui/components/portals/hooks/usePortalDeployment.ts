// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../lib/firebase';
import toast from 'react-hot-toast';
import { PortalConfig, DeploymentStatus, PortalError, PortalOperationResult } from '../../../../types/portal-types';

export const usePortalDeployment = (
  portalConfig: PortalConfig,
  portalUrl?: string,
  deploymentStatus?: DeploymentStatus,
  onPortalSuccess?: (result: PortalOperationResult) => void,
  onPortalError?: (error: PortalError) => void
) => {
  const [deploymentPolling, setDeploymentPolling] = useState(false);
  const deploymentIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Firebase functions
  const getDeploymentStatus = httpsCallable(functions, 'getDeploymentStatus');
  const triggerDeployment = httpsCallable(functions, 'triggerPortalDeployment');
  
  // Deployment status polling
  const pollDeploymentStatus = useCallback(async () => {
    if (!deploymentStatus || deploymentStatus.phase === 'completed' || deploymentStatus.phase === 'failed') {
      return;
    }
    
    try {
      const result = await getDeploymentStatus({ portalId: portalConfig.id });
      const status = result.data as DeploymentStatus;
      
      if (status.phase === 'completed') {
        toast.success('Portal deployment completed successfully!');
        setDeploymentPolling(false);
        onPortalSuccess?.({ success: true, operation: 'deploy', data: status, duration: 0, timestamp: new Date() });
      } else if (status.phase === 'failed') {
        toast.error('Portal deployment failed');
        setDeploymentPolling(false);
        onPortalError?.(status.error || new Error('Deployment failed') as PortalError);
      }
      
    } catch (err) {
      console.warn('Failed to poll deployment status:', err);
    }
  }, [deploymentStatus, portalConfig.id, getDeploymentStatus, onPortalSuccess, onPortalError]);
  
  // Copy portal URL
  const handleCopyUrl = useCallback(async () => {
    if (!portalUrl) {
      toast.error('Portal URL not available');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(portalUrl);
      toast.success('Portal URL copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  }, [portalUrl]);
  
  // Share portal
  const handleShare = useCallback(async () => {
    if (!portalUrl || !navigator.share) {
      toast.error('Sharing not supported on this device');
      return;
    }
    
    try {
      await navigator.share({
        title: portalConfig.metadata.title,
        text: portalConfig.metadata.description,
        url: portalUrl
      });
    } catch (err) {
      console.warn('Share failed:', err);
    }
  }, [portalUrl, portalConfig.metadata]);
  
  // Trigger manual deployment
  const handleManualDeploy = useCallback(async () => {
    try {
      setDeploymentPolling(true);
      await triggerDeployment({ portalId: portalConfig.id });
      toast.success('Deployment started...');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to trigger deployment');
      onPortalError?.(error as PortalError);
      toast.error('Failed to start deployment');
      setDeploymentPolling(false);
    }
  }, [portalConfig.id, triggerDeployment, onPortalError]);
  
  // Deployment polling setup
  useEffect(() => {
    if (deploymentPolling && deploymentStatus && 
        deploymentStatus.phase !== 'completed' && 
        deploymentStatus.phase !== 'failed') {
      deploymentIntervalRef.current = setInterval(pollDeploymentStatus, 2000);
    } else {
      if (deploymentIntervalRef.current) {
        clearInterval(deploymentIntervalRef.current);
        deploymentIntervalRef.current = null;
      }
    }
    
    return () => {
      if (deploymentIntervalRef.current) {
        clearInterval(deploymentIntervalRef.current);
      }
    };
  }, [deploymentPolling, deploymentStatus, pollDeploymentStatus]);
  
  return {
    deploymentPolling,
    handleCopyUrl,
    handleShare,
    handleManualDeploy
  };
};