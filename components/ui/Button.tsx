import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-accent text-white shadow-sm hover:bg-blue-600 focus-visible:ring-brand-accent",
  secondary:
    "bg-brand-primary text-white shadow-sm hover:bg-brand-primary-dark focus-visible:ring-brand-primary",
  outline:
    "border-2 border-brand-primary/30 bg-white text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5",
  ghost: "text-slate-700 hover:bg-slate-100",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export function Button({
  children,
  variant = "primary",
  href,
  className = "",
  type = "button",
  onClick,
}: {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
