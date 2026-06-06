import { relativeUpdatedAt } from "@/lib/formatUtils";

export function StaleDataHint({ updatedAt }: { updatedAt?: string }) {
  const relative = relativeUpdatedAt(updatedAt);

  return (
    <p className="inline-flex flex-wrap items-center gap-2 text-sm text-slate-600">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Refreshes every 5–10 min
      </span>
      {relative && <span>Updated {relative}</span>}
    </p>
  );
}
