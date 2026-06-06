import type { ReactNode } from "react";

export function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
