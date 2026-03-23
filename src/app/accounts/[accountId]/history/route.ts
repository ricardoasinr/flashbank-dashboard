import { NextRequest, NextResponse } from "next/server";
import { buildTransactionHistoryPage } from "@/lib/mockTransactionApi";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> | { accountId: string } },
) {
  const { accountId } = await Promise.resolve(params);
  const data = buildTransactionHistoryPage(accountId, request.nextUrl.searchParams);
  return NextResponse.json(data);
}
