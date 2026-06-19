"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type QuickPickItem = {
  label: string;
  value: string;
};

type QuickPickListProps = {
  items: QuickPickItem[];
  onPick: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

export function QuickPickList({
  items,
  onPick,
  className,
  disabled = false,
}: QuickPickListProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <Button
          key={item.label}
          type="button"
          variant="subtle"
          onClick={() => onPick(item.value)}
          className="h-8 px-3 text-xs shadow-sm"
          disabled={disabled}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
