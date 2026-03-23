export type TransactionType = "credit" | "debit";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  createdAt: string;
  reviewed: boolean;
}

/** Agregados sobre el historial completo que coincide con los filtros (no solo la página actual). */
export interface TransactionSummary {
  totalCredit: number;
  totalDebit: number;
  pendingCount: number;
}

export interface TransactionPage {
  data: Transaction[];
  nextCursor: string | null;
  total: number;
  summary: TransactionSummary;
}

export interface TransactionFilters {
  type?: TransactionType | "all";
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}
