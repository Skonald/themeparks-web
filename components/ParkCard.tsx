import Link from "next/link";
import { formatParkLocation } from "@/lib/api/parks";
import type { Park } from "@/lib/api/types";
import {
  getParkOperatorCategory,
  operatorBadgeClass,
  operatorGradient,
} from "@/lib/parkUtils";

export function ParkCard({
  park,
  compact = false,
}: {
  park: Park;
  compact?: boolean;
}) {
  const category = getParkOperatorCategory(park);
  const location = formatParkLocation(park);

  return (
    <Link
      href={`/parks/${park.park_id}`}
      className="card-interactive group flex flex-col overflow-hidden"
    >
      <div
        className={`relative bg-gradient-to-br ${operatorGradient(park)} ${compact ? "h-20" : "h-28"} px-4 py-3`}
      >
        <span
          className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-medium ${operatorBadgeClass(park)}`}
        >
          {category}
        </span>
        <div className="flex h-full items-end">
          <h3
            className={`font-bold leading-tight text-white drop-shadow-sm ${compact ? "text-base" : "text-lg"}`}
          >
            {park.name}
          </h3>
        </div>
      </div>
      <div className={`${compact ? "p-3" : "p-4"}`}>
        {location && <p className="text-sm text-slate-500">{location}</p>}
        <p className="mt-2 text-xs font-medium text-brand-accent opacity-0 transition-opacity group-hover:opacity-100">
          View waits &amp; forecasts →
        </p>
      </div>
    </Link>
  );
}
