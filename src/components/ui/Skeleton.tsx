import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-700", className)}
      {...props}
    />
  );
}

export function TransactionSkeleton() {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      aria-hidden="true"
    >
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}
