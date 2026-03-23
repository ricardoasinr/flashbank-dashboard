import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchTransactionHistory,
  markTransactionReviewed,
} from "@/services/transactionService";
import type { Transaction, TransactionFilters, TransactionPage } from "@/types/transaction";

const STALE_TIME = 5 * 60 * 1000; // 5 minutos: los datos de historial cambian poco en el corto plazo
const PAGE_SIZE = 20;

export function useTransactionHistory(
  accountId: string,
  filters: TransactionFilters = {},
) {
  const queryClient = useQueryClient();

  const queryKey = ["transactions", accountId, filters] as const;

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchTransactionHistory(
        accountId,
        pageParam as string | null,
        filters,
        PAGE_SIZE,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: TransactionPage) => lastPage.nextCursor ?? undefined,
    staleTime: STALE_TIME,
    enabled: Boolean(accountId),
  });

  const transactions: Transaction[] =
    data?.pages.flatMap((page) => page.data) ?? [];

  const total = data?.pages[0]?.total ?? 0;

  const { mutate: markAsReviewed } = useMutation({
    mutationFn: (transactionId: string) =>
      markTransactionReviewed(transactionId, accountId),

    onMutate: async (transactionId: string) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      // Optimistic update: marcar como revisada antes de confirmar
      queryClient.setQueryData(
        queryKey,
        (old: { pages: TransactionPage[]; pageParams: unknown[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((txn) =>
                txn.id === transactionId ? { ...txn, reviewed: true } : txn,
              ),
            })),
          };
        },
      );

      return { previousData };
    },

    onError: (_err, _transactionId, context) => {
      // Rollback si el servidor falla
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    // En producción (Route Handlers serverless) el “reviewed” en memoria no se comparte
    // entre instancias; invalidar aquí puede pisar el optimistic update tras el refetch.
    onSettled: (_data, error) => {
      if (error || process.env.NODE_ENV === "production") return;
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    transactions,
    total,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    markAsReviewed,
  };
}
