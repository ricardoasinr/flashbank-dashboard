import type { TransactionFilters, TransactionPage } from "@/types/transaction";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function fetchTransactionHistory(
  accountId: string,
  cursor: string | null,
  filters: TransactionFilters,
  pageSize = 20,
): Promise<TransactionPage> {
  const params = new URLSearchParams();
  params.set("limit", String(pageSize));

  if (cursor) params.set("cursor", cursor);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.amountMin != null) params.set("amountMin", String(filters.amountMin));
  if (filters.amountMax != null) params.set("amountMax", String(filters.amountMax));
  if (filters.search) params.set("search", filters.search);

  const res = await fetch(
    `${BASE_URL}/accounts/${accountId}/history?${params.toString()}`,
  );

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<TransactionPage>;
}

export async function markTransactionReviewed(
  transactionId: string,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/transactions/${transactionId}/reviewed`, {
    method: "PATCH",
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
}
