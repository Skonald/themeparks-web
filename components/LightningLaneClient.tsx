"use client";

import { useMemo, useState } from "react";
import type { AttractionWait } from "@/lib/api/types";

interface LlRow {
  id: string;
  name: string;
  types: string[];
  returnTime?: string;
  available?: boolean;
}

function extractLlRows(attractions: AttractionWait[]): LlRow[] {
  return attractions
    .filter((a) => (a.access_features?.length ?? 0) > 0)
    .map((a) => {
      const types = a.access_features
        ?.map((f) => f.type)
        .filter(Boolean) as string[];
      const avail = a.access_features?.find((f) => f.availability);
      return {
        id: a.attraction_id,
        name: a.attraction_name,
        types: types ?? [],
        returnTime: avail?.availability?.return_time,
        available: avail?.availability?.available,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function LightningLaneClient({
  attractions,
}: {
  attractions: AttractionWait[];
}) {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => extractLlRows(attractions), [attractions]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, query]);

  if (rows.length === 0) {
    return (
      <div className="card px-6 py-12 text-center">
        <p className="text-lg font-medium text-slate-800">
          No Lightning Lane data for this park
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Reference availability appears when the park reports skip-the-line
          options on live wait feeds.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Informational only — booking and Multi Pass planning happen in the mobile
        app.
      </p>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search attractions…"
        className="input-field max-w-md"
      />
      <ul className="space-y-2">
        {filtered.map((r) => (
          <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium text-slate-900">{r.name}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {r.types.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right text-sm">
              {r.available === true && (
                <span className="font-medium text-emerald-700">Available</span>
              )}
              {r.available === false && (
                <span className="text-slate-500">Unavailable</span>
              )}
              {r.returnTime && (
                <p className="text-xs text-slate-500">Return {r.returnTime}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
