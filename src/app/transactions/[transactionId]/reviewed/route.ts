import { NextRequest, NextResponse } from "next/server";
import { patchTransactionReviewed } from "@/lib/mockTransactionApi";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> | { transactionId: string } },
) {
  const { transactionId } = await Promise.resolve(params);
  const accountId = request.nextUrl.searchParams.get("accountId") ?? "acc-1";

  const result = patchTransactionReviewed(accountId, transactionId, {
    simulateRandomFailure: false,
  });

  if (!result.ok) {
    return new NextResponse(null, { status: result.status });
  }

  return NextResponse.json(result.body);
}
