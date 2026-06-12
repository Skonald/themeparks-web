"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Park } from "@/lib/api/types";
import { getParkRouteId, shortParkName } from "@/lib/parkUtils";
import { activeParkTabFromPath } from "@/components/ParkSubNavFromPath";

export function ParkPills({
  groupName,
  parks,
  activeParkId,
}: {
  groupName: string;
  parks: Park[];
  activeParkId: string;
}) {
  const pathname = usePathname();
  const activeTab = activeParkTabFromPath(pathname, activeParkId);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {groupName}
      </p>
      <div className="-mx-0.5 flex gap-2 overflow-x-auto px-0.5 py-1 scrollbar-none">
        {parks.map((p) => {
          const active =
            p.park_id === activeParkId || p.slug === activeParkId;
          const label = shortParkName(p.name);
          return (
            <Link
              key={p.park_id}
              href={`/parks/${getParkRouteId(p)}/${activeTab}`}
              className={`chip shrink-0 ${active ? "chip-resort-active" : "chip-resort-inactive"}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
