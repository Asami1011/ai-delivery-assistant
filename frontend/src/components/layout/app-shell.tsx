"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { features } from "@/lib/features";
import { cn } from "@/lib/utils";

const navItems = [{ title: "ホーム", href: "/" }, ...features.map(({ title, href }) => ({ title, href }))];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const activeItem = useMemo(
    () => navItems.find((item) => item.href === pathname) ?? navItems[0],
    [pathname],
  );

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 xl:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link className="text-base font-semibold text-neutral-950" href="/">
              ai-delivery-assistant
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden text-sm text-neutral-500 sm:block">Application foundation</div>
              <button
                className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-300 px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950 sm:hidden"
                onClick={() => setIsMobileNavOpen((prev) => !prev)}
                type="button"
              >
                {isMobileNavOpen ? "閉じる" : "メニュー"}
              </button>
            </div>
          </div>

          <div className="border-t border-neutral-200 py-3 sm:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-neutral-500">現在のページ</p>
                <p className="truncate text-sm font-semibold text-neutral-950">{activeItem.title}</p>
              </div>
            </div>

            {isMobileNavOpen ? (
              <nav className="mt-3 grid gap-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      className={cn(
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-neutral-950 text-white"
                          : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
                      )}
                      href={item.href}
                      key={item.href}
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            ) : null}
          </div>

          <nav className="hidden gap-2 overflow-x-auto border-t border-neutral-200 py-3 sm:flex">
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
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 xl:px-8">
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
