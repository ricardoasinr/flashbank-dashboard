"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";

interface TransactionItemProps {
  transaction: Transaction;
  onMarkReviewed: (id: string) => void;
  style?: React.CSSProperties;
}

const STATUS_ICONS = {
  pending: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
  completed: <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />,
  failed: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />,
} as const;

const STATUS_LABELS = {
  pending: "Pendiente",
  completed: "Completada",
  failed: "Fallida",
} as const;

const TYPE_LABELS = {
  credit: "Crédito",
  debit: "Débito",
} as const;

export function TransactionItem({
  transaction,
  onMarkReviewed,
  style,
}: TransactionItemProps) {
  const relativeDate = formatDistanceToNow(new Date(transaction.createdAt), {
    addSuffix: true,
    locale: es,
  });

  const formattedAmount = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: transaction.currency,
  }).format(transaction.amount);

  return (
    <article
      style={style}
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-white p-4 transition-all hover:shadow-sm",
        "dark:bg-slate-900",
        transaction.status === "failed"
          ? "border-red-100 dark:border-red-900/30"
          : "border-slate-100 dark:border-slate-800",
      )}
      aria-label={`Transacción ${TYPE_LABELS[transaction.type]}: ${formattedAmount}, ${STATUS_LABELS[transaction.status]}, ${relativeDate}`}
    >
      {/* Icono tipo */}
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
          transaction.type === "credit"
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
        )}
        aria-hidden="true"
      >
        {transaction.type === "credit" ? (
          <ArrowDownLeft className="h-5 w-5" />
        ) : (
          <ArrowUpRight className="h-5 w-5" />
        )}
      </div>

      {/* Info principal */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
          {transaction.description}
        </p>
        <time
          dateTime={transaction.createdAt}
          className="text-xs text-slate-500 dark:text-slate-400"
        >
          {relativeDate}
        </time>
      </div>

      {/* Monto y estado */}
      <div className="flex flex-col items-end gap-1.5">
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            transaction.type === "credit"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-800 dark:text-slate-200",
          )}
        >
          {transaction.type === "credit" ? "+" : "-"}
          {formattedAmount}
        </span>

        <div className="flex items-center gap-1.5">
          <Badge variant={transaction.status}>
            <span className="flex items-center gap-1">
              {STATUS_ICONS[transaction.status]}
              <span>{STATUS_LABELS[transaction.status]}</span>
            </span>
          </Badge>

          <Badge variant={transaction.type === "credit" ? "credit" : "debit"}>
            {TYPE_LABELS[transaction.type]}
          </Badge>
        </div>
      </div>

      {/* Acción revisar */}
      {!transaction.reviewed ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMarkReviewed(transaction.id)}
          aria-label={`Marcar transacción ${transaction.description} como revisada`}
          title="Marcar como revisada"
          className="ml-1 flex-shrink-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ) : (
        <Badge variant="reviewed" className="ml-1 flex-shrink-0">
          Revisada
        </Badge>
      )}
    </article>
  );
}
