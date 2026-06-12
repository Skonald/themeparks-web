"use client";

import { useMemo, useState } from "react";
import type { Park } from "@/lib/api/types";
import {
  filterParks,
  type ParkOperatorFilter,
} from "@/lib/parkUtils";
import { ParkCard } from "@/components/ParkCard";
import { Button } from "@/components/ui/Button";

const FILTERS: ParkOperatorFilter[] = [
  "All",
  "Disney",
  "Universal",
  "Six Flags",
  "Other",
];

const PAGE_SIZE = 20;

export function ParksBrowseClient({ parks }: { parks: Park[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ParkOperatorFilter>("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => filterParks(parks, query, filter),
    [parks, query, filter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const slice = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function onFilterChange(next: ParkOperatorFilter) {
    setFilter(next);
    setPage(1);
  }

  function onQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search parks by name…"
            className="input-field pl-10"
            aria-label="Search parks"
          />
        </div>
        <p className="shrink-0 text-sm text-slate-500">
          {filtered.length} park{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onFilterChange(f)}
            className={`chip ${filter === f ? "chip-active" : "chip-inactive"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {slice.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <p className="text-lg font-medium text-slate-800">
            No parks match your search
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Try a different name or clear the operator filter.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setQuery("");
              setFilter("All");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {slice.map((park) => (
              <ParkCard key={park.park_id} park={park} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-40"
                    : ""
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
