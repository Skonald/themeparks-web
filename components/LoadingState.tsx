export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-slate-500">
      <span className="animate-pulse">{label}</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="h-28 bg-slate-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function SkeletonRow({ lines = 1 }: { lines?: number }) {
  return (
    <div className="card animate-pulse space-y-3 p-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-slate-200" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
