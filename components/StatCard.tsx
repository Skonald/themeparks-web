import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="card flex items-start gap-4 p-5">
      {icon && (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent ?? "bg-brand-primary/10 text-brand-primary"}`}
        >
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </div>
      </div>
    </div>
  );
}
