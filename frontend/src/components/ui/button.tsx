import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "subtle";
};

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonLinkProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const variants = {
  primary: "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800",
  secondary: "border-neutral-300 bg-white text-neutral-950 hover:bg-neutral-100",
  ghost: "border-transparent bg-transparent text-neutral-700 hover:bg-neutral-100",
  subtle:
    "border-neutral-300 bg-neutral-50 text-neutral-800 hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-950",
};

const baseClass =
  "inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button className={cn(baseClass, variants[variant], className)} type={type} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  variant = "primary",
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(baseClass, variants[variant], className)} href={href} {...props}>
      {children}
    </Link>
  );
}
