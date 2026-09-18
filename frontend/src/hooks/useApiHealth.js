import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../services/api';

/**
 * Hook to verify frontend-to-backend communication
 */
export function useApiHealth() {
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkStatus = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const response = await checkHealth();
      if (response && response.success) {
        setIsConnected(true);
        setStatusMessage(response.message || 'API Connected');
      } else {
        setIsConnected(false);
        setStatusMessage('API responded with unexpected format');
      }
    } catch (err) {
      setIsConnected(false);
      setError(err.message);
      setStatusMessage(err.message || 'API Unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    checkHealth()
      .then((response) => {
        if (!isMounted) return;
        if (response && response.success) {
          setIsConnected(true);
          setStatusMessage(response.message || 'API Connected');
        } else {
          setIsConnected(false);
          setStatusMessage('API responded with unexpected format');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsConnected(false);
        setError(err.message);
        setStatusMessage(err.message || 'API Unavailable');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const recheck = useCallback(() => checkStatus(true), [checkStatus]);

  return {
    isConnected,
    statusMessage,
    loading,
    error,
    recheck,
  };
}

export default useApiHealth;
