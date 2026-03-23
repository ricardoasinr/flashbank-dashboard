"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { TransactionFilters } from "@/types/transaction";

const DEBOUNCE_MS = 300;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useTransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Leer estado inicial desde URL
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );

  const filters: TransactionFilters = useMemo(
    () => ({
      type:
        (searchParams.get("type") as TransactionFilters["type"]) ?? "all",
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      amountMin: searchParams.get("amountMin")
        ? Number(searchParams.get("amountMin"))
        : undefined,
      amountMax: searchParams.get("amountMax")
        ? Number(searchParams.get("amountMax"))
        : undefined,
      search: searchParams.get("search") ?? undefined,
    }),
    [searchParams],
  );

  // Debounce para la búsqueda
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_MS);

  // Sincronizar búsqueda debounceada con URL
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateUrl({ search: debouncedSearch || undefined });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const updateUrl = useCallback(
    (partial: Partial<TransactionFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(partial).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handleFilterChange = useCallback(
    (partial: Partial<TransactionFilters>) => {
      updateUrl(partial);
    },
    [updateUrl],
  );

  const handleReset = useCallback(() => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    filters,
    searchInput,
    setSearchInput,
    handleFilterChange,
    handleReset,
  };
}
