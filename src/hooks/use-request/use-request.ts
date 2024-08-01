import { DependencyList, useState, useEffect, useCallback, useRef } from "react";
interface Result<Data> {
  data: Data | any;
  loading: boolean;
  error: any;
  refresh(): void;
}

interface Options {
  onSuccess(): void;
  onError(): void;
  refreshDeps: DependencyList;
  /**
   * 是否开启Suspense
   */
  suspense: boolean;
  defaultParams: number[];
  cacheKey?: string; // Key for cache
}

/**
 * 实现一个useRequest的hooks
 * 需要实现以下几点
 * 1. 错误处理
 * 2. 竞态条件
 * 3. 数据更改和重新验证
 * 4. typescript 类型支持
 * 可选实现以下几点
 * 1. 数据缓存、缓存刷新
 * 2. 兼容 Suspense
 * 3. 兼容 React 18 Concurrent Rendering
 */
export function useRequest<Data>(
  fetcher: (...args: any[]) => Promise<Data>,
  options: Partial<Options> = {}
): Result<Data> {
  const {
    onSuccess,
    onError,
    refreshDeps = [],
    suspense = false,
    defaultParams = [],
    cacheKey = JSON.stringify(defaultParams),
  } = options as Options;
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const isMounted = useRef(true);
  const cache = useRef<Map<string, Data>>(new Map());
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (typeof fetcher === "function") {
        // 缓存判断
        if (cache.current.has(cacheKey)) {
          setData(cache.current.get(cacheKey) || null);
          setLoading(false);
        } else {
          const result = await fetcher(...defaultParams);
          // 竞态判断--防止组件在请求未完成时卸载，试图更新组件
          if (isMounted.current) {
            setData(result);
            cache.current.set(cacheKey, result);
            if (onSuccess) onSuccess();
          }
          setLoading(false);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err);
        if (onError) onError();
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [...defaultParams, ...refreshDeps, cacheKey]);

  useEffect(() => {
    isMounted.current = true;
    refresh();

    return () => {
      isMounted.current = false;
    };
  }, [refresh]);

  // 兼容 Suspense
  if (suspense && loading) {
    throw new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (!loading) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
  }

  return {
    data,
    loading,
    error,
    refresh,
  };
}
