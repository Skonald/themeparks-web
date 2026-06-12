import type { ParkOperatingHours } from "@/lib/api/types";
import { getParkHoursInfo } from "@/lib/parkHoursUtils";

const STATUS_STYLES = {
  Open: {
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  Closed: {
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  Unknown: {
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
} as const;

export function ParkStatusBar({
  hours,
}: {
  hours: ParkOperatingHours | null;
}) {
  const { status, hoursLabel } = getParkHoursInfo(hours);
  const statusStyle = STATUS_STYLES[status];

  return (
    <div
      className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 sm:px-4"
      aria-label="Park status and hours"
    >
      <span
        className={`inline-flex items-center gap-2 text-sm font-medium ${statusStyle.text}`}
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${statusStyle.dot}`}
          aria-hidden
        />
        {status}
      </span>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary">
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {hoursLabel}
      </span>
    </div>
  );
}
