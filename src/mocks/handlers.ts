import { http, HttpResponse } from "msw";
import type { TransactionType } from "@/types/transaction";
import { getTransactionsForAccount, updateTransactionReviewed } from "./db";

export const handlers = [
  http.get("/accounts/:accountId/history", ({ request, params }) => {
    const { accountId } = params as { accountId: string };
    const url = new URL(request.url);

    const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const cursor = url.searchParams.get("cursor");
    const type = url.searchParams.get("type") as TransactionType | null;
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const amountMin = url.searchParams.get("amountMin");
    const amountMax = url.searchParams.get("amountMax");
    const search = url.searchParams.get("search");

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

    return HttpResponse.json({
      data: page,
      nextCursor,
      total,
    });
  }),

  http.patch("/transactions/:transactionId/reviewed", ({ params, request }) => {
    const { transactionId } = params as { transactionId: string };
    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId") ?? "acc-1";

    // Simulate occasional failure for optimistic update testing
    if (Math.random() < 0.1) {
      return new HttpResponse(null, { status: 500 });
    }

    updateTransactionReviewed(accountId, transactionId);
    return HttpResponse.json({ success: true });
  }),
];
