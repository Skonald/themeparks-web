import Link from "next/link";
import type { ReactNode } from "react";

export function FeatureCard({
  icon,
  title,
  body,
  href,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
      {href && (
        <p className="mt-3 text-xs font-medium text-brand-accent">
          Learn more →
        </p>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="card-interactive block p-6">
        {content}
      </Link>
    );
  }

  return <div className="card p-6">{content}</div>;
}
