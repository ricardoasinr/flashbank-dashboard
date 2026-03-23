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

/** PRNG determinista por cuenta + índice (serverless y MSW comparten la misma “fuente de verdad”). */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFor(accountId: string, index: number): number {
  let h = 2166136261;
  for (let i = 0; i < accountId.length; i++) {
    h ^= accountId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h + index * 41) >>> 0;
}

function randomFrom<T>(arr: T[], next: () => number): T {
  return arr[Math.floor(next() * arr.length)];
}

function generateTransaction(index: number, accountId: string): Transaction {
  const next = mulberry32(seedFor(accountId, index));
  const type = randomFrom(TYPES, next);
  const statusWeights = [0.1, 0.8, 0.1];
  const rand = next();
  const status: TransactionStatus =
    rand < statusWeights[0]
      ? "pending"
      : rand < statusWeights[0] + statusWeights[1]
        ? "completed"
        : "failed";

  const daysAgo = Math.floor(next() * 365);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    id: `txn-${accountId}-${index}`,
    accountId,
    type,
    amount: parseFloat((next() * 9900 + 100).toFixed(2)),
    currency: "MXN",
    description: randomFrom(DESCRIPTIONS, next),
    status,
    createdAt: date.toISOString(),
    reviewed: next() > 0.7,
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
