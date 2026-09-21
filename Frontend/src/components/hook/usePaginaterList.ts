import { useState, useCallback } from "react";

interface PaginatedResponse<T> {
  data: T[];
  hasNextPage: boolean
}

export function usePaginatedList<T>(
  fetchFn: (page: number, pageSize: number) => Promise<PaginatedResponse<T> | T[]>,
  pageSize = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const fetchPage = useCallback(async (targetPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFn(targetPage, pageSize);

      const items: T[] = Array.isArray(response) ? response : response.data;
      const nextAvailable = Array.isArray(response) ? false : (response?.hasNextPage ?? false);

      setHasMore(nextAvailable);
      setData((prev) => (targetPage === 1 ? items : [...prev, ...items]));
      setPage(targetPage);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, pageSize]);

  const fetchNextPage = useCallback(() => {
    if (!loading && hasMore) {
      fetchPage(page + 1);
    }
  }, [loading, hasMore, page, fetchPage]);

  const reset = useCallback(() => {
    setPage(1);
    setData([]);
    setHasMore(true);
  }, []);

  return {
    data,
    setData,
    loading,
    error,
    setError,
    hasMore,
    fetchPage,
    fetchNextPage,
    reset, setLoading
  };

}
