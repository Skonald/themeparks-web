"use client";

import { useMemo, useState } from "react";
import type { AttractionWait } from "@/lib/api/types";
import { waitLevelClass, waitLevelLabel } from "@/lib/api/waits";

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
      list = list.filter((a) => a.status?.toLowerCase() !== "closed");
    }
    if (llOnly) {
      list = list.filter((a) => (a.access_features?.length ?? 0) > 0);
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

function llSummary(a: AttractionWait): string {
  const types = a.access_features
    ?.map((f) => f.type)
    .filter(Boolean) as string[] | undefined;
  if (!types?.length) return "—";
  return types.join(", ");
}

function WaitRow({ attraction: a }: { attraction: AttractionWait }) {
  const label = waitLevelLabel(a.wait_time_minutes);
  return (
    <tr className="hover:bg-slate-50/80">
      <td className="px-4 py-3 font-medium text-slate-900">
        {a.attraction_name}
      </td>
      <td className="px-4 py-3 text-slate-600">{a.status ?? "—"}</td>
      <td className="px-4 py-3">
        <span className={`font-semibold ${waitLevelClass(a.wait_time_minutes)}`}>
          {a.wait_time_minutes != null ? `${a.wait_time_minutes} min` : "—"}
        </span>
        {a.wait_time_minutes != null && (
          <span className="ml-2 text-xs text-slate-500">({label})</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-slate-600">{llSummary(a)}</td>
    </tr>
  );
}

function WaitCard({ attraction: a }: { attraction: AttractionWait }) {
  const label = waitLevelLabel(a.wait_time_minutes);
  const ll = llSummary(a);
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
      <p className="mt-1 text-xs text-slate-500">{a.status ?? "Unknown"}</p>
      {ll !== "—" && (
        <p className="mt-2 inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {ll}
        </p>
      )}
    </div>
  );
}
