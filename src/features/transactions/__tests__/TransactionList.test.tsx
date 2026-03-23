import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { TransactionList } from "../components/TransactionList";
import type { Transaction } from "@/types/transaction";

// El virtualizer necesita dimensiones reales para renderizar ítems.
// En jsdom (sin layout real) retorna 0 ítems. Mockeamos el módulo para
// simular que todos los ítems son visibles durante las pruebas.
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: () => number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({
        index: i,
        start: i * estimateSize(),
        size: estimateSize(),
        key: i,
      })),
    getTotalSize: () => count * estimateSize(),
  }),
}));

const mockTransactions: Transaction[] = [
  {
    id: "txn-1",
    accountId: "acc-1",
    type: "credit",
    amount: 1500.0,
    currency: "MXN",
    description: "Pago de nómina",
    status: "completed",
    createdAt: new Date().toISOString(),
    reviewed: false,
  },
  {
    id: "txn-2",
    accountId: "acc-1",
    type: "debit",
    amount: 350.5,
    currency: "MXN",
    description: "Compra en supermercado",
    status: "pending",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    reviewed: true,
  },
  {
    id: "txn-3",
    accountId: "acc-1",
    type: "debit",
    amount: 200.0,
    currency: "MXN",
    description: "Retiro en cajero",
    status: "failed",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    reviewed: false,
  },
];

describe("TransactionList (integración)", () => {
  it("debe renderizar estado de carga con skeletons", () => {
    render(
      createElement(TransactionList, {
        transactions: [],
        isLoading: true,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: vi.fn(),
        onMarkReviewed: vi.fn(),
        total: 0,
      }),
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Cargando transacciones")).toBeInTheDocument();
  });

  it("debe renderizar estado de error con mensaje", () => {
    render(
      createElement(TransactionList, {
        transactions: [],
        isLoading: false,
        isError: true,
        error: new Error("Servicio no disponible"),
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: vi.fn(),
        onMarkReviewed: vi.fn(),
        total: 0,
      }),
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Servicio no disponible")).toBeInTheDocument();
    expect(screen.getByText(/Reintentar/i)).toBeInTheDocument();
  });

  it("debe renderizar estado vacío cuando no hay transacciones", () => {
    render(
      createElement(TransactionList, {
        transactions: [],
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: vi.fn(),
        onMarkReviewed: vi.fn(),
        total: 0,
      }),
    );

    expect(screen.getByText(/Sin transacciones/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No se encontraron transacciones/i),
    ).toBeInTheDocument();
  });

  it("debe renderizar lista de transacciones y llamar markAsReviewed al hacer click", async () => {
    const user = userEvent.setup();
    const onMarkReviewed = vi.fn();

    render(
      createElement(TransactionList, {
        transactions: mockTransactions,
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: vi.fn(),
        onMarkReviewed,
        total: mockTransactions.length,
      }),
    );

    expect(screen.getByRole("list", { name: /Transacciones/i })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBe(mockTransactions.length);

    // Click en el botón de revisar del primer ítem no revisado
    const reviewButton = screen.getAllByRole("button", {
      name: /Marcar transacción/i,
    })[0];

    await user.click(reviewButton!);
    expect(onMarkReviewed).toHaveBeenCalledWith("txn-1");
  });
});
