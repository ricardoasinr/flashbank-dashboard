import type { Transaction, TransactionStatus, TransactionType } from "@/types/transaction";

const DESCRIPTIONS = [
  "Compra en supermercado",
  "Transferencia recibida",
  "Pago de servicios",
  "Retiro en cajero",
  "Pago con tarjeta",
  "Depósito en cuenta",
  "Pago de nómina",
  "Compra online",
  "Transferencia enviada",
  "Pago de suscripción",
  "Recarga de celular",
  "Pago de renta",
  "Ingreso por freelance",
  "Comisión bancaria",
  "Devolución de compra",
  "Pago de seguro",
  "Inversión en fondo",
  "Retiro de fondo",
  "Pago de crédito",
  "Depósito en efectivo",
];

const TYPES: TransactionType[] = ["credit", "debit"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTransaction(index: number, accountId: string): Transaction {
  const type = randomFrom(TYPES);
  const statusWeights = [0.1, 0.8, 0.1];
  const rand = Math.random();
  const status: TransactionStatus =
    rand < statusWeights[0]
      ? "pending"
      : rand < statusWeights[0] + statusWeights[1]
        ? "completed"
        : "failed";

  const daysAgo = Math.floor(Math.random() * 365);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    id: `txn-${accountId}-${index}`,
    accountId,
    type,
    amount: parseFloat((Math.random() * 9900 + 100).toFixed(2)),
    currency: "MXN",
    description: randomFrom(DESCRIPTIONS),
    status,
    createdAt: date.toISOString(),
    reviewed: Math.random() > 0.7,
  };
}

const transactionCache = new Map<string, Transaction[]>();

export function getTransactionsForAccount(accountId: string): Transaction[] {
  if (!transactionCache.has(accountId)) {
    const txns = Array.from({ length: 500 }, (_, i) =>
      generateTransaction(i, accountId),
    ).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    transactionCache.set(accountId, txns);
  }
  return transactionCache.get(accountId)!;
}

export function updateTransactionReviewed(
  accountId: string,
  transactionId: string,
): void {
  const txns = transactionCache.get(accountId);
  if (!txns) return;
  const txn = txns.find((t) => t.id === transactionId);
  if (txn) txn.reviewed = true;
}
