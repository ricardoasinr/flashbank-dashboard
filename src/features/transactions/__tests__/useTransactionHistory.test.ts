import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useTransactionHistory } from "../hooks/useTransactionHistory";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe("useTransactionHistory", () => {
  it("debe retornar transacciones después de la carga inicial", async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(
      () => useTransactionHistory("acc-1"),
      { wrapper },
    );

    // Estado inicial: cargando
    expect(result.current.isLoading).toBe(true);
    expect(result.current.transactions).toEqual([]);

    // Esperar a que carguen
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.transactions.length).toBeGreaterThan(0);
    expect(result.current.transactions[0]).toMatchObject({
      id: expect.any(String),
      type: expect.stringMatching(/^(credit|debit)$/),
      amount: expect.any(Number),
      status: expect.stringMatching(/^(pending|completed|failed)$/),
    });
  });

  it("debe exponer hasNextPage y fetchNextPage para paginación infinita", async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(
      () => useTransactionHistory("acc-2"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Con 500 transacciones en el mock, debe haber más páginas
    expect(result.current.hasNextPage).toBe(true);
    expect(typeof result.current.fetchNextPage).toBe("function");
    expect(result.current.total).toBeGreaterThan(0);
  });

  it("debe filtrar por tipo de transacción", async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(
      () => useTransactionHistory("acc-1", { type: "credit" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.transactions.forEach((txn) => {
      expect(txn.type).toBe("credit");
    });
  });
});
