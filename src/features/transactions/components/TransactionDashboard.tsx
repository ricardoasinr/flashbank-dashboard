"use client";

import { useMemo } from "react";
import { CreditCard, TrendingDown, TrendingUp, Activity } from "lucide-react";
import { TransactionList } from "./TransactionList";
import { TransactionFilters } from "./TransactionFilters";
import { useTransactionHistory } from "../hooks/useTransactionHistory";
import { useTransactionFilters } from "../hooks/useTransactionFilters";

interface TransactionDashboardProps {
  accountId: string;
}

export function TransactionDashboard({ accountId }: TransactionDashboardProps) {
  const { filters, searchInput, setSearchInput, handleFilterChange, handleReset } =
    useTransactionFilters();

  const {
    transactions,
    total,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    markAsReviewed,
  } = useTransactionHistory(accountId, filters);

  // Derivar estadísticas de resumen sin re-renders innecesarios
  const stats = useMemo(() => {
    const credits = transactions.filter((t) => t.type === "credit");
    const debits = transactions.filter((t) => t.type === "debit");
    const totalCredit = credits.reduce((acc, t) => acc + t.amount, 0);
    const totalDebit = debits.reduce((acc, t) => acc + t.amount, 0);
    const pending = transactions.filter((t) => t.status === "pending").length;

    return { credits: credits.length, debits: debits.length, totalCredit, totalDebit, pending };
  }, [transactions]);

  const formatMXN = (amount: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
      amount,
    );

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Activity className="h-5 w-5 text-indigo-500" />}
          label="Total"
          value={String(total)}
          bg="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          label="Créditos"
          value={formatMXN(stats.totalCredit)}
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatCard
          icon={<TrendingDown className="h-5 w-5 text-red-500" />}
          label="Débitos"
          value={formatMXN(stats.totalDebit)}
          bg="bg-red-50 dark:bg-red-900/20"
        />
        <StatCard
          icon={<CreditCard className="h-5 w-5 text-yellow-500" />}
          label="Pendientes"
          value={String(stats.pending)}
          bg="bg-yellow-50 dark:bg-yellow-900/20"
        />
      </div>

      {/* Filtros */}
      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
      />

      {/* Lista */}
      <TransactionList
        transactions={transactions}
        isLoading={isLoading}
        isError={isError}
        error={error instanceof Error ? error : null}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        onMarkReviewed={markAsReviewed}
        total={total}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}

function StatCard({ icon, label, value, bg }: StatCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800 ${bg}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="truncate font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}
