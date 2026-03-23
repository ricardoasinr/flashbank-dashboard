import { http, HttpResponse } from "msw";
import {
  buildTransactionHistoryPage,
  patchTransactionReviewed,
} from "@/lib/mockTransactionApi";

export const handlers = [
  http.get("/accounts/:accountId/history", ({ request, params }) => {
    const { accountId } = params as { accountId: string };
    const url = new URL(request.url);
    const data = buildTransactionHistoryPage(accountId, url.searchParams);
    return HttpResponse.json(data);
  }),

  http.patch("/transactions/:transactionId/reviewed", ({ params, request }) => {
    const { transactionId } = params as { transactionId: string };
    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId") ?? "acc-1";

    const result = patchTransactionReviewed(accountId, transactionId, {
      simulateRandomFailure: true,
    });

    if (!result.ok) {
      return new HttpResponse(null, { status: result.status });
    }

    return HttpResponse.json(result.body);
  }),
];
