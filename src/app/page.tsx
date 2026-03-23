import Link from "next/link";
import { CreditCard, ArrowRight } from "lucide-react";

const DEMO_ACCOUNTS = [
  { id: "acc-1", name: "Cuenta Principal", last4: "4231" },
  { id: "acc-2", name: "Cuenta de Ahorros", last4: "8892" },
  { id: "acc-3", name: "Cuenta Empresarial", last4: "1147" },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
          <CreditCard className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          FlashBank
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Selecciona una cuenta para ver su historial de transacciones
        </p>
      </div>

      <div className="space-y-3">
        {DEMO_ACCOUNTS.map((account) => (
          <Link
            key={account.id}
            href={`/accounts/${account.id}`}
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {account.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  •••• {account.last4}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
          </Link>
        ))}
      </div>
    </main>
  );
}
