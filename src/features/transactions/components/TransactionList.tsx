"use client";

import { useEffect, useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AlertCircle, RefreshCw, Inbox, Loader2 } from "lucide-react";
import { TransactionItem } from "./TransactionItem";
import { TransactionSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import type { Transaction } from "@/types/transaction";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onMarkReviewed: (id: string) => void;
  total: number;
}

const ITEM_HEIGHT = 88; // altura estimada de cada ítem en px

export function TransactionList({
  transactions,
  isLoading,
  isError,
  error,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onMarkReviewed,
  total,
}: TransactionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  // Intersection Observer para cargar más al llegar al final
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Cargando transacciones"
        className="space-y-3"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <TransactionSkeleton key={i} />
        ))}
        <span className="sr-only">Cargando transacciones...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex flex-col items-center gap-4 rounded-xl border border-red-100 bg-red-50 p-10 text-center dark:border-red-900/30 dark:bg-red-900/10"
      >
        <AlertCircle className="h-10 w-10 text-red-500" aria-hidden="true" />
        <div>
          <p className="font-semibold text-red-700 dark:text-red-400">
            Error al cargar las transacciones
          </p>
          <p className="mt-1 text-sm text-red-500 dark:text-red-500">
            {error?.message ?? "Error desconocido"}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-16 text-center dark:border-slate-800 dark:bg-slate-900/50"
      >
        <Inbox
          className="h-12 w-12 text-slate-300 dark:text-slate-600"
          aria-hidden="true"
        />
        <div>
          <p className="font-semibold text-slate-600 dark:text-slate-400">
            Sin transacciones
          </p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            No se encontraron transacciones con los filtros aplicados.
          </p>
        </div>
      </div>
    );
  }

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <section aria-label={`Lista de transacciones, ${total} en total`}>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
        Mostrando {transactions.length} de {total} transacciones
      </p>

      {/* Contenedor scrolleable con virtualización */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-y-auto rounded-xl pr-1 focus:outline-none"
        tabIndex={0}
        role="list"
        aria-label="Transacciones"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualRow) => {
            const txn = transactions[virtualRow.index];
            if (!txn) return null;

            return (
              <div
                key={txn.id}
                role="listitem"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  padding: "0 0 8px 0",
                }}
              >
                <TransactionItem
                  transaction={txn}
                  onMarkReviewed={onMarkReviewed}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Sentinel para infinite scroll */}
      <div ref={loadMoreRef} className="mt-4 flex justify-center" aria-live="polite">
        {isFetchingNextPage && (
          <div
            role="status"
            aria-label="Cargando más transacciones"
            className="flex items-center gap-2 text-sm text-slate-500"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Cargando más...
          </div>
        )}
        {!hasNextPage && transactions.length > 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Has llegado al final del historial
          </p>
        )}
      </div>
    </section>
  );
}
