"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useQueryHelpers() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const getQueryParams = () => new URLSearchParams(searchParams?.toString());

  const updateQuery = (params: URLSearchParams) => {
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const addQueryParam = (key: string, value: string) => {
    const params = getQueryParams();
    params.append(key, value);
    updateQuery(params);
  };

  const setQueryParam = (key: string, value: string) => {
    const params = getQueryParams();
    params.set(key, value);
    updateQuery(params);
  };

  const removeQueryParam = (key: string, value?: string) => {
    const params = getQueryParams();

    if (value === undefined) {
      params.delete(key);
    } else {
      const values = params.getAll(key).filter((v) => v !== value);
      params.delete(key);
      values.forEach((v) => params.append(key, v));
    }

    updateQuery(params);
  };

  const clearAllQueryParams = () => {
    router.replace(pathname, { scroll: false });
  };

  const setMultipleQueryParams = (updates: Record<string, string>) => {
    const params = getQueryParams();

    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value);
    });

    updateQuery(params);
  };

  return {
    getQueryParams,
    addQueryParam,
    setQueryParam,
    removeQueryParam,
    clearAllQueryParams,
    setMultipleQueryParams,
  };
}
