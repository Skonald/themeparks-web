"use client";

import { useMemo, useState } from "react";
import {
  LightningLanePassBadges,
  llPassKinds,
} from "@/components/LightningLanePassIcon";
import type { AttractionWait } from "@/lib/api/types";
import {
  isAttractionOpen,
  waitLevelClass,
  waitLevelLabel,
} from "@/lib/api/waits";

type SortKey = "wait-desc" | "wait-asc" | "name";

export function WaitsListClient({
  attractions,
}: {
  attractions: AttractionWait[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("wait-desc");
  const [openOnly, setOpenOnly] = useState(false);
  const [llOnly, setLlOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = [...attractions];

    if (openOnly) {
      list = list.filter((a) => isAttractionOpen(a.status));
    }
    if (llOnly) {
      list = list.filter((a) => llPassKinds(a).length > 0);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) =>
        a.attraction_name.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      if (sort === "name") {
        return a.attraction_name.localeCompare(b.attraction_name);
      }
      const aw = a.wait_time_minutes ?? -1;
      const bw = b.wait_time_minutes ?? -1;
      return sort === "wait-desc" ? bw - aw : aw - bw;
    });

    return list;
  }, [attractions, query, sort, openOnly, llOnly]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search attractions…"
          className="input-field lg:max-w-xs"
          aria-label="Search attractions"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="input-field lg:w-44"
          aria-label="Sort by"
        >
          <option value="wait-desc">Wait: high to low</option>
          <option value="wait-asc">Wait: low to high</option>
          <option value="name">Name A–Z</option>
        </select>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpenOnly((v) => !v)}
            className={`chip ${openOnly ? "chip-active" : "chip-inactive"}`}
          >
            Open only
          </button>
          <button
            type="button"
            onClick={() => setLlOnly((v) => !v)}
            className={`chip ${llOnly ? "chip-active" : "chip-inactive"}`}
          >
            Has Lightning Lane
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        {filtered.length} attraction{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="card px-6 py-10 text-center text-slate-600">
          No attractions match your filters.
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Attraction</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Wait</th>
                  <th className="px-4 py-3 font-semibold">Lightning Lane</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <WaitRow key={a.attraction_id} attraction={a} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {filtered.map((a) => (
              <WaitCard key={a.attraction_id} attraction={a} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function formatStatus(status: string | undefined): string {
  if (!status) return "—";
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function WaitRow({ attraction: a }: { attraction: AttractionWait }) {
  const label = waitLevelLabel(a.wait_time_minutes);
  return (
    <tr className="hover:bg-slate-50/80">
      <td className="px-4 py-3 font-medium text-slate-900">
        {a.attraction_name}
      </td>
      <td className="px-4 py-3 text-slate-600">{formatStatus(a.status)}</td>
      <td className="px-4 py-3">
        <span className={`font-semibold ${waitLevelClass(a.wait_time_minutes)}`}>
          {a.wait_time_minutes != null ? `${a.wait_time_minutes} min` : "—"}
        </span>
        {a.wait_time_minutes != null && (
          <span className="ml-2 text-xs text-slate-500">({label})</span>
        )}
      </td>
      <td className="px-4 py-3">
        <LightningLanePassBadges attraction={a} />
      </td>
    </tr>
  );
}

function WaitCard({ attraction: a }: { attraction: AttractionWait }) {
  const label = waitLevelLabel(a.wait_time_minutes);
  const hasLl = llPassKinds(a).length > 0;
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-slate-900">{a.attraction_name}</p>
        <div className="text-right">
          <span
            className={`text-sm font-bold ${waitLevelClass(a.wait_time_minutes)}`}
          >
            {a.wait_time_minutes != null ? `${a.wait_time_minutes}m` : "—"}
          </span>
          {a.wait_time_minutes != null && (
            <p className="text-xs text-slate-500">{label}</p>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-500">{formatStatus(a.status)}</p>
      {hasLl && (
        <div className="mt-2">
          <LightningLanePassBadges attraction={a} compact />
        </div>
      )}
    </div>
  );
}
