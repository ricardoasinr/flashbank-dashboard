/**
 * Server Component: este nivel puede ser Server Component porque solo
 * extrae el accountId de params y delega la interactividad al Client Component.
 * No necesita estado ni efectos del cliente.
 */
import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, CreditCard } from "lucide-react";
import { TransactionDashboard } from "@/features/transactions/components/TransactionDashboard";

interface AccountPageProps {
  params: { accountId: string };
}

export function generateMetadata({ params }: AccountPageProps) {
  return {
    title: `Cuenta ${params.accountId} — FlashBank`,
  };
}

export default function AccountPage({ params }: AccountPageProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-200"
          aria-label="Volver a la lista de cuentas"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Cuentas
        </Link>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Historial de transacciones
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Cuenta: {params.accountId}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard (Client Component) */}
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        }
      >
        <TransactionDashboard accountId={params.accountId} />
      </Suspense>
    </main>
  );
}
