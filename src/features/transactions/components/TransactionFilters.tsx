"use client";

import { useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { TransactionFilters as Filters } from "@/types/transaction";

interface TransactionFiltersProps {
  filters: Filters;
  onFilterChange: (partial: Partial<Filters>) => void;
  onReset: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const TYPE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "credit", label: "Crédito" },
  { value: "debit", label: "Débito" },
] as const;

export function TransactionFilters({
  filters,
  onFilterChange,
  onReset,
  searchValue,
  onSearchChange,
}: TransactionFiltersProps) {
  const handleTypeChange = useCallback(
    (value: string) => {
      onFilterChange({ type: value as Filters["type"] });
    },
    [onFilterChange],
  );

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.amountMin != null ||
    filters.amountMax != null ||
    searchValue;

  return (
    <section
      aria-label="Filtros de transacciones"
      className="space-y-4 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filtros
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            aria-label="Limpiar todos los filtros"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por descripción..."
          aria-label="Buscar transacciones por descripción"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white py-0 pl-9 pr-3 text-sm placeholder-slate-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tipo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tipo
          </label>
          <div
            role="group"
            aria-label="Filtrar por tipo de transacción"
            className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
          >
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleTypeChange(opt.value)}
                aria-pressed={
                  (filters.type ?? "all") === opt.value
                }
                className={cn(
                  "flex-1 px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset",
                  (filters.type ?? "all") === opt.value
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha desde */}
        <Input
          id="date-from"
          label="Desde"
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(e) => onFilterChange({ dateFrom: e.target.value || undefined })}
          max={filters.dateTo}
          aria-label="Fecha desde"
        />

        {/* Fecha hasta */}
        <Input
          id="date-to"
          label="Hasta"
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(e) => onFilterChange({ dateTo: e.target.value || undefined })}
          min={filters.dateFrom}
          aria-label="Fecha hasta"
        />

        {/* Monto */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Monto (BOB)
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="Mín"
              value={filters.amountMin ?? ""}
              onChange={(e) =>
                onFilterChange({
                  amountMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              min={0}
              aria-label="Monto mínimo"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <span className="text-slate-400 dark:text-slate-500">–</span>
            <input
              type="number"
              placeholder="Máx"
              value={filters.amountMax ?? ""}
              onChange={(e) =>
                onFilterChange({
                  amountMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              min={0}
              aria-label="Monto máximo"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
