import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/apiClient';

export function useApi(method, url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (payload = {}, config = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient[method](url, payload, config);
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [method, url]);

  return { data, loading, error, callApi };
}
