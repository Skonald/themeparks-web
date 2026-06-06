import Link from "next/link";
import type { Park } from "@/lib/api/types";

export function ParkPills({
  groupName,
  parks,
  activeParkId,
}: {
  groupName: string;
  parks: Park[];
  activeParkId: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {groupName}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {parks.map((p) => {
          const active = p.park_id === activeParkId;
          const shortName = p.name
            .replace(/Park|Theme Park|Disney's /gi, "")
            .trim();
          return (
            <Link
              key={p.park_id}
              href={`/parks/${p.park_id}`}
              className={`chip shrink-0 ${active ? "chip-active" : "chip-inactive"}`}
            >
              {shortName || p.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
