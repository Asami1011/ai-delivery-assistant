import { cn } from "@/lib/utils";

export function Loading({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-neutral-600", className)} role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-950" />
      <span>{label}</span>
    </div>
  );
}
