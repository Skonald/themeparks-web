import Link from "next/link";
import { formatParkLocation } from "@/lib/api/parks";
import type { Park } from "@/lib/api/types";
import {
  getParkOperatorCategory,
  operatorBadgeClass,
} from "@/lib/parkUtils";

export function ParkPageHeader({ park }: { park: Park }) {
  const category = getParkOperatorCategory(park);

  return (
    <header className="space-y-3">
      <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/parks" className="hover:text-brand-primary hover:underline">
          Parks
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-700">{park.name}</span>
      </nav>
      <div className="flex flex-wrap items-start gap-3">
        <h1 className="section-title">{park.name}</h1>
        <span
          className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${operatorBadgeClass(park)}`}
        >
          {category}
        </span>
      </div>
      {formatParkLocation(park) && (
        <p className="text-slate-600">{formatParkLocation(park)}</p>
      )}
    </header>
  );
}
