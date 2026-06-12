"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Park } from "@/lib/api/types";
import { getParkWaitTimes } from "@/lib/api/waits";
import { getParkRouteId, searchParks } from "@/lib/parkUtils";

interface AttractionHit {
  attractionName: string;
  park: Park;
}

type GlobalSearchVariant = "hero" | "nav";

const variantStyles: Record<
  GlobalSearchVariant,
  { input: string; icon: string }
> = {
  hero: {
    input:
      "w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-blue-200 shadow-sm backdrop-blur-sm focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20",
    icon: "text-blue-300",
  },
  nav: {
    input: "input-field py-2 pl-9 pr-3 text-sm",
    icon: "text-slate-400",
  },
};

export function GlobalSearchClient({
  parks,
  featuredParks,
  variant = "nav",
  className = "",
}: {
  parks: Park[];
  featuredParks: Park[];
  variant?: GlobalSearchVariant;
  className?: string;
}) {
  const router = useRouter();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [attractionHits, setAttractionHits] = useState<AttractionHit[]>([]);
  const [loadingAttractions, setLoadingAttractions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parkHits = useMemo(
    () => searchParks(parks, query, 5),
    [parks, query],
  );

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || featuredParks.length === 0) {
      setAttractionHits([]);
      setLoadingAttractions(false);
      return;
    }

    setLoadingAttractions(true);
    const timer = window.setTimeout(async () => {
      const needle = q.toLowerCase();
      const results: AttractionHit[] = [];

      await Promise.all(
        featuredParks.map(async (park) => {
          const waits = await getParkWaitTimes(park.park_id);
          if (!waits?.attractions) return;

          for (const attraction of waits.attractions) {
            if (attraction.attraction_name?.toLowerCase().includes(needle)) {
              results.push({
                attractionName: attraction.attraction_name,
                park,
              });
            }
          }
        }),
      );

      results.sort((a, b) =>
        a.attractionName.localeCompare(b.attractionName),
      );
      setAttractionHits(results.slice(0, 8));
      setLoadingAttractions(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, featuredParks]);

  const hasResults =
    parkHits.length > 0 || attractionHits.length > 0 || loadingAttractions;
  const showDropdown = open && query.trim().length > 0;

  const firstHref = useMemo(() => {
    if (parkHits[0]) return `/parks/${getParkRouteId(parkHits[0])}/trends`;
    if (attractionHits[0]) {
      return `/parks/${getParkRouteId(attractionHits[0].park)}/waits`;
    }
    return null;
  }, [parkHits, attractionHits]);

  const navigateFirst = useCallback(() => {
    if (firstHref) {
      router.push(firstHref);
      setOpen(false);
      setQuery("");
    }
  }, [firstHref, router]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const styles = variantStyles[variant];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <svg
        className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${styles.icon}`}
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
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            navigateFirst();
          }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search parks, rides, attractions…"
        className={styles.input}
        aria-label="Search parks, rides, and attractions"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        role="combobox"
      />

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-card"
        >
          {!hasResults && !loadingAttractions && (
            <p className="px-4 py-3 text-sm text-slate-500">
              No parks or attractions match.
            </p>
          )}

          {parkHits.length > 0 && (
            <div className="border-b border-slate-100 py-1">
              <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Parks
              </p>
              {parkHits.map((park) => (
                <Link
                  key={park.park_id}
                  href={`/parks/${getParkRouteId(park)}/trends`}
                  role="option"
                  className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="font-medium text-slate-900">{park.name}</span>
                  {park.operator && (
                    <span className="ml-2 text-slate-500">{park.operator}</span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {(loadingAttractions || attractionHits.length > 0) && (
            <div className="py-1">
              <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Attractions
              </p>
              {loadingAttractions && attractionHits.length === 0 && (
                <p className="px-4 py-2 text-sm text-slate-500">Searching…</p>
              )}
              {attractionHits.map((hit) => (
                <Link
                  key={`${hit.park.park_id}-${hit.attractionName}`}
                  href={`/parks/${getParkRouteId(hit.park)}/waits`}
                  role="option"
                  className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="font-medium text-slate-900">
                    {hit.attractionName}
                  </span>
                  <span className="ml-2 text-slate-500">{hit.park.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
