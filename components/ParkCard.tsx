import Image from "next/image";
import Link from "next/link";
import { formatParkLocation } from "@/lib/api/parks";
import type { Park } from "@/lib/api/types";
import {
  getParkOperatorCategory,
  getParkRouteId,
  operatorBadgeClass,
  operatorGradient,
} from "@/lib/parkUtils";

function parkSubtitle(park: Park): string {
  const location = formatParkLocation(park);
  if (location) return location;
  if (park.operator) return park.operator;
  if (park.timezone) {
    return park.timezone.replace(/_/g, " ").replace(/\//g, ", ");
  }
  return getParkOperatorCategory(park);
}

export function ParkCard({
  park,
  compact = false,
}: {
  park: Park;
  compact?: boolean;
}) {
  const category = getParkOperatorCategory(park);
  const subtitle = parkSubtitle(park);
  const routeId = getParkRouteId(park);

  return (
    <Link
      href={`/parks/${routeId}/trends`}
      className="card-interactive group flex h-full flex-col overflow-hidden"
    >
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${operatorGradient(park)} ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}
      >
        {park.image_url && (
          <Image
            src={park.image_url}
            alt=""
            fill
            className="object-cover opacity-40"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        )}
        <h3
          className={`relative line-clamp-2 font-bold leading-snug text-white drop-shadow-sm ${compact ? "text-base" : "text-base sm:text-lg"}`}
        >
          {park.name}
        </h3>
      </div>
      <div
        className={`flex flex-1 flex-col ${compact ? "gap-1.5 p-3" : "gap-2 px-4 py-3"}`}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${operatorBadgeClass(park)}`}
          >
            {category}
          </span>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <p className="mt-auto text-xs font-medium text-brand-accent group-hover:underline">
          View waits &amp; forecasts →
        </p>
      </div>
    </Link>
  );
}
