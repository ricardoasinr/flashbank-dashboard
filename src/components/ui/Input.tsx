import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ className, label, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-slate-500 dark:text-slate-400"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30",
          className,
        )}
        {...props}
      />
    </div>
  );
}
