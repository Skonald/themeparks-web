import type { AttractionWait } from "@/lib/api/types";

export type LlPassKind = "single" | "multi";

export function classifyLlPass(type: string): LlPassKind | null {
  const t = type.toLowerCase();
  if (t.includes("single") || t.includes("paid")) return "single";
  if (t.includes("multi")) return "multi";
  return null;
}

/** Distinct pass kinds on an attraction, Single Pass listed before Multi Pass. */
export function llPassKinds(attraction: AttractionWait): LlPassKind[] {
  const kinds = new Set<LlPassKind>();
  for (const feature of attraction.access_features ?? []) {
    const kind = classifyLlPass(feature.type ?? "");
    if (kind) kinds.add(kind);
  }
  return [...kinds].sort((a, b) => (a === "single" ? -1 : b === "single" ? 1 : 0));
}

const PASS_META: Record<
  LlPassKind,
  { label: string; badgeClass: string; title: string }
> = {
  single: {
    label: "Single Pass",
    badgeClass: "bg-amber-50 text-amber-900 ring-amber-200/80",
    title: "Single Pass (individual Lightning Lane purchase)",
  },
  multi: {
    label: "Multi Pass",
    badgeClass: "bg-violet-50 text-violet-900 ring-violet-200/80",
    title: "Multi Pass (included in Lightning Lane bundle)",
  },
};

/** One lightning bolt — Multi Pass. */
function MultiPassBolt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

/** Stacked twin bolts — Single Pass (visually distinct from Multi). */
function SinglePassBolt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M8 3 3 11h4l-0.5 6 5.5-8H8.5L8 3z" opacity="0.5" />
      <path d="M16 3 11 11h4l-0.5 6 5.5-8h-3.5L16 3z" />
    </svg>
  );
}

export function LightningLanePassIcon({
  kind,
  className = "h-4 w-4 shrink-0",
}: {
  kind: LlPassKind;
  className?: string;
}) {
  return kind === "single" ? (
    <SinglePassBolt className={className} />
  ) : (
    <MultiPassBolt className={className} />
  );
}

export function LightningLanePassBadge({
  kind,
  showLabel = true,
  compact = false,
}: {
  kind: LlPassKind;
  showLabel?: boolean;
  compact?: boolean;
}) {
  const meta = PASS_META[kind];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset ${meta.badgeClass} ${
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
      title={meta.title}
    >
      <LightningLanePassIcon kind={kind} className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {showLabel ? <span>{meta.label}</span> : (
        <span className="sr-only">{meta.label}</span>
      )}
    </span>
  );
}

export function LightningLanePassBadges({
  attraction,
  compact = false,
}: {
  attraction: AttractionWait;
  compact?: boolean;
}) {
  const kinds = llPassKinds(attraction);
  if (kinds.length === 0) {
    return <span className="text-slate-400">—</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {kinds.map((kind) => (
        <LightningLanePassBadge key={kind} kind={kind} compact={compact} />
      ))}
    </div>
  );
}
