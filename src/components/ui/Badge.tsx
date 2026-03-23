import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        pending:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        completed:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        failed:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        credit:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        debit:
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        reviewed:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      },
    },
    defaultVariants: { variant: "pending" },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
