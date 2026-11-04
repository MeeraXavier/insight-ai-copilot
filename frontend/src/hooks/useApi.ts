import { useState, useEffect } from "react";

interface UseApiOptions {
  maxRetries?: number;
  retryDelay?: number;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const executeWithRetry = async (
    fn: () => Promise<T>,
    retriesLeft: number
  ): Promise<T> => {
    try {
      return await fn();
    } catch (err) {
      if (retriesLeft > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return executeWithRetry(fn, retriesLeft - 1);
      }
      throw err;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await executeWithRetry(fetcher, maxRetries);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
