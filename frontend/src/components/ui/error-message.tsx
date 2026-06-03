import { cn } from "@/lib/utils";

export function ErrorMessage({
  title = "Error",
  message,
  className,
}: {
  title?: string;
  message: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-red-200 bg-red-50 p-4 text-sm", className)} role="alert">
      <p className="font-medium text-red-900">{title}</p>
      <p className="mt-1 text-red-700">{message}</p>
    </div>
  );
}
