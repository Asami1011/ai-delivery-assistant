"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { features } from "@/lib/features";
import { cn } from "@/lib/utils";

const navItems = [{ title: "ホーム", href: "/" }, ...features.map(({ title, href }) => ({ title, href }))];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link className="text-base font-semibold text-neutral-950" href="/">
            ai-delivery-assistant
          </Link>
          <div className="hidden text-sm text-neutral-500 sm:block">Application foundation</div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <nav className="flex gap-2 overflow-x-auto rounded-lg border border-neutral-200 bg-white p-2 shadow-sm lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
