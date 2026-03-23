import type { TransactionPage, TransactionType } from "@/types/transaction";
import { getTransactionsForAccount, updateTransactionReviewed } from "@/mocks/db";

/** Lógica compartida entre MSW (dev) y Route Handlers (producción). */
export function buildTransactionHistoryPage(
  accountId: string,
  searchParams: URLSearchParams,
): TransactionPage {
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const cursor = searchParams.get("cursor");
  const type = searchParams.get("type") as TransactionType | null;
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const amountMin = searchParams.get("amountMin");
  const amountMax = searchParams.get("amountMax");
  const search = searchParams.get("search");

  let transactions = getTransactionsForAccount(accountId);

  if (type) transactions = transactions.filter((t) => t.type === type);
  if (dateFrom)
    transactions = transactions.filter(
      (t) => new Date(t.createdAt) >= new Date(dateFrom),
    );
  if (dateTo)
    transactions = transactions.filter(
      (t) => new Date(t.createdAt) <= new Date(dateTo),
    );
  if (amountMin)
    transactions = transactions.filter((t) => t.amount >= parseFloat(amountMin));
  if (amountMax)
    transactions = transactions.filter((t) => t.amount <= parseFloat(amountMax));
  if (search) {
    const q = search.toLowerCase();
    transactions = transactions.filter((t) =>
      t.description.toLowerCase().includes(q),
    );
  }

  const total = transactions.length;
  const startIndex = cursor
    ? transactions.findIndex((t) => t.id === cursor) + 1
    : 0;
  const page = transactions.slice(startIndex, startIndex + limit);
  const nextCursor = page.length === limit ? (page[page.length - 1]?.id ?? null) : null;

  return {
    data: page,
    nextCursor,
    total,
  };
}

export type PatchReviewedResult =
  | { ok: true; body: { success: boolean } }
  | { ok: false; status: number };

/**
 * Simula fallo ocasional solo cuando `simulateRandomFailure` es true (MSW / pruebas manuales).
 */
export function patchTransactionReviewed(
  accountId: string,
  transactionId: string,
  options?: { simulateRandomFailure?: boolean },
): PatchReviewedResult {
  if (options?.simulateRandomFailure && Math.random() < 0.1) {
    return { ok: false, status: 500 };
  }

  updateTransactionReviewed(accountId, transactionId);
  return { ok: true, body: { success: true } };
}
