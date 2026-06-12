import Link from "next/link";

type CtaVariant = "accent" | "white" | "ghost-dark" | "ghost-light";

const styles: Record<CtaVariant, string> = {
  accent:
    "bg-brand-accent text-white shadow-lg shadow-blue-900/30 hover:bg-blue-600",
  white:
    "bg-white text-brand-primary shadow-lg shadow-blue-950/20 hover:bg-blue-50",
  "ghost-dark":
    "border-2 border-white/40 text-white hover:border-white hover:bg-white/10",
  "ghost-light":
    "border-2 border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5",
};

export function HeroPrimaryCta({
  href = "/download",
  label,
  variant = "accent",
  className = "",
}: {
  href?: string;
  label: string;
  variant?: CtaVariant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition ${styles[variant]} ${className}`}
    >
      {label}
    </Link>
  );
}
