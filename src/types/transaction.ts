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

export interface TransactionPage {
  data: Transaction[];
  nextCursor: string | null;
  total: number;
}

export interface TransactionFilters {
  type?: TransactionType | "all";
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}
