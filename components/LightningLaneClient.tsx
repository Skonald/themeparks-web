"use client";

import { useMemo, useState } from "react";
import {
  classifyLlPass,
  LightningLanePassBadge,
  type LlPassKind,
} from "@/components/LightningLanePassIcon";
import type { AccessFeature, AttractionWait } from "@/lib/api/types";

type RowStatus = "available" | "sold-out" | "unavailable";
type PassFilter = "all" | LlPassKind;
type SortKey = "status" | "return" | "price" | "name";

interface LlRow {
  key: string;
  attractionId: string;
  name: string;
  kind: LlPassKind;
  status: RowStatus;
  returnTime: string | null;
  returnLabel: string | null;
  priceAmount: number | null;
  currency: string;
  standbyWait: number | null;
}

/** Park-local "8:45 PM" from an ISO string like 2026-05-26T20:45:00-04:00 (no TZ conversion). */
function formatReturnTime(iso: string): string | null {
  const m = iso.match(/T(\d{2}):(\d{2})/);
  if (!m) return null;
  const hour = parseInt(m[1], 10);
  const minute = m[2];
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${minute} ${period}`;
}

function formatPrice(amount: number, currency: string): string {
  const symbol = currency === "USD" ? "$" : `${currency} `;
  return Number.isInteger(amount)
    ? `${symbol}${amount}`
    : `${symbol}${amount.toFixed(2)}`;
}

function rowStatus(feature: AccessFeature): RowStatus {
  const avail = feature.availability;
  if (avail?.available === true) return "available";
  const booking = (avail?.booking_status ?? feature.status ?? "").toUpperCase();
  if (booking === "FINISHED" || booking === "SOLD_OUT") return "sold-out";
  return "unavailable";
}

function extractLlRows(attractions: AttractionWait[]): LlRow[] {
  const rows: LlRow[] = [];
  for (const a of attractions) {
    for (const f of a.access_features ?? []) {
      const kind = classifyLlPass(f.type ?? "");
      if (!kind) continue;
      const returnTime = f.availability?.return_time ?? null;
      const rawPrice = f.price_amount ?? f.availability?.price_amount ?? null;
      const priceAmount =
        kind === "single" && rawPrice != null && rawPrice > 0 ? rawPrice : null;
      rows.push({
        key: `${a.attraction_id}-${kind}`,
        attractionId: a.attraction_id,
        name: a.attraction_name,
        kind,
        status: rowStatus(f),
        returnTime,
        returnLabel: returnTime ? formatReturnTime(returnTime) : null,
        priceAmount,
        currency: f.currency ?? "USD",
        standbyWait: a.wait_time_minutes ?? null,
      });
    }
  }
  return rows;
}

const STATUS_META: Record<RowStatus, { label: string; chip: string; dot: string }> = {
  available: {
    label: "Available",
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
    dot: "bg-emerald-500",
  },
  "sold-out": {
    label: "Sold out",
    chip: "bg-rose-50 text-rose-700 ring-rose-200/80",
    dot: "bg-rose-400",
  },
  unavailable: {
    label: "Unavailable",
    chip: "bg-slate-100 text-slate-500 ring-slate-200/80",
    dot: "bg-slate-400",
  },
};

function StatusChip({ status }: { status: RowStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.chip}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  );
}

const STATUS_ORDER: Record<RowStatus, number> = {
  available: 0,
  "sold-out": 1,
  unavailable: 2,
};

function sortRows(rows: LlRow[], sort: SortKey): LlRow[] {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "return") {
      const at = a.returnTime ?? "9999";
      const bt = b.returnTime ?? "9999";
      if (at !== bt) return at.localeCompare(bt);
      return a.name.localeCompare(b.name);
    }
    if (sort === "price") {
      const ap = a.priceAmount ?? Number.POSITIVE_INFINITY;
      const bp = b.priceAmount ?? Number.POSITIVE_INFINITY;
      if (ap !== bp) return ap - bp;
      return a.name.localeCompare(b.name);
    }
    // status: available first, then soonest return, then name
    if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) {
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    }
    const at = a.returnTime ?? "9999";
    const bt = b.returnTime ?? "9999";
    if (at !== bt) return at.localeCompare(bt);
    return a.name.localeCompare(b.name);
  });
  return sorted;
}

export function LightningLaneClient({
  attractions,
}: {
  attractions: AttractionWait[];
}) {
  const [query, setQuery] = useState("");
  const [passFilter, setPassFilter] = useState<PassFilter>("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("status");

  const rows = useMemo(() => extractLlRows(attractions), [attractions]);

  const filtered = useMemo(() => {
    let list = rows;
    if (passFilter !== "all") list = list.filter((r) => r.kind === passFilter);
    if (availableOnly) list = list.filter((r) => r.status === "available");
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    return sortRows(list, sort);
  }, [rows, passFilter, availableOnly, query, sort]);

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
    <div className="space-y-5">
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
          className="input-field lg:w-48"
          aria-label="Sort by"
        >
          <option value="status">Available first</option>
          <option value="return">Soonest return</option>
          <option value="price">Price: low to high</option>
          <option value="name">Name A–Z</option>
        </select>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["multi", "Multi Pass"],
              ["single", "Single Pass"],
            ] as Array<[PassFilter, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPassFilter(value)}
              className={`chip ${passFilter === value ? "chip-active" : "chip-inactive"}`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAvailableOnly((v) => !v)}
            className={`chip ${availableOnly ? "chip-active" : "chip-inactive"}`}
          >
            Available now
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        {filtered.length} result{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="card px-6 py-10 text-center text-slate-600">
          No Lightning Lanes match your filters.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Attraction</th>
                  <th className="px-4 py-3 font-semibold">Pass</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Next return</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.key} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{r.name}</p>
                      {r.standbyWait != null && r.standbyWait >= 0 && (
                        <p className="text-xs text-slate-500">
                          Standby {r.standbyWait} min
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <LightningLanePassBadge kind={r.kind} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      {r.returnLabel ? (
                        <span className="font-medium text-slate-800">
                          {r.returnLabel}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.priceAmount != null ? (
                        <span className="font-semibold text-slate-900">
                          {formatPrice(r.priceAmount, r.currency)}
                        </span>
                      ) : r.kind === "multi" ? (
                        <span
                          className="text-xs text-slate-500"
                          title="Included with Multi Pass purchase"
                        >
                          Included
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {filtered.map((r) => (
              <div key={r.key} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{r.name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <LightningLanePassBadge kind={r.kind} compact />
                      <StatusChip status={r.status} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {r.priceAmount != null && (
                      <p className="font-semibold text-slate-900">
                        {formatPrice(r.priceAmount, r.currency)}
                      </p>
                    )}
                    {r.returnLabel && (
                      <p className="text-xs text-slate-500">
                        Return {r.returnLabel}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-slate-500">
        Informational only — booking and Multi Pass planning happen in the
        mobile app. Return times are park-local.
      </p>
    </div>
  );
}
