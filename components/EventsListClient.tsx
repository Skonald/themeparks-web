"use client";

import { useMemo, useState } from "react";
import type { ParkEvent } from "@/lib/api/types";
import { formatDisplayDate } from "@/lib/formatUtils";

export function EventsListClient({ events }: { events: ParkEvent[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const types = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.event_type) set.add(e.event_type);
    });
    return ["All", ...Array.from(set).sort()];
  }, [events]);

  const filtered = useMemo(() => {
    let list = [...events];
    if (typeFilter !== "All") {
      list = list.filter((e) => e.event_type === typeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) =>
      (a.start_date ?? "").localeCompare(b.start_date ?? ""),
    );
  }, [events, query, typeFilter]);

  if (events.length === 0) {
    return (
      <div className="card px-6 py-12 text-center">
        <p className="text-lg font-medium text-slate-800">
          No special events in the next 90 days
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Check back closer to your visit for parties and early-entry schedules.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events…"
          className="input-field sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`chip ${typeFilter === t ? "chip-active" : "chip-inactive"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-8 text-center text-slate-600">
          No events match your search.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((e, i) => (
            <li key={e.event_id ?? i} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-semibold text-slate-900">{e.name}</p>
                {e.event_type && (
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-800">
                    {e.event_type}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {e.start_date && formatDisplayDate(e.start_date)}
                {e.end_date && e.end_date !== e.start_date && (
                  <> – {formatDisplayDate(e.end_date)}</>
                )}
                {e.start_time && (
                  <span className="text-slate-500">
                    {" "}
                    · {e.start_time.slice(0, 5)}
                    {e.end_time ? `–${e.end_time.slice(0, 5)}` : ""}
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
