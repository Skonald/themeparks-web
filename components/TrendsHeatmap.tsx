"use client";

import { formatHourLabel } from "@/lib/formatUtils";

export const DEFAULT_TREND_HOURS = Array.from({ length: 13 }, (_, i) => i + 9);

export type HeatmapVariant = "wait" | "ll-sellout" | "character";

export interface TrendsHeatmapRow {
  id: string;
  label: string;
  subtitle?: string;
  cells: Record<number, number | boolean | null | undefined>;
}

interface Props {
  rowHeader: string;
  hours?: number[];
  rows: TrendsHeatmapRow[];
  variant: HeatmapVariant;
  emptyMessage?: string;
}

function waitHeatClass(minutes: number): string {
  if (minutes <= 20) return "bg-emerald-100 text-emerald-800";
  if (minutes <= 45) return "bg-amber-100 text-amber-800";
  if (minutes <= 75) return "bg-orange-100 text-orange-800";
  return "bg-rose-100 text-rose-800";
}

function llHeatClass(rate: number): string {
  if (rate <= 0.15) return "bg-emerald-100 text-emerald-800";
  if (rate <= 0.5) return "bg-amber-100 text-amber-800";
  if (rate <= 0.85) return "bg-orange-100 text-orange-800";
  return "bg-rose-100 text-rose-800";
}

function formatWaitCell(value: number | boolean | null | undefined): {
  label: string;
  title: string;
  className: string;
} {
  const minutes = typeof value === "number" ? value : 0;
  if (minutes <= 0) {
    return { label: "—", title: "No data", className: "bg-slate-50 text-slate-400" };
  }
  return {
    label: String(Math.round(minutes)),
    title: `${Math.round(minutes)} min median`,
    className: waitHeatClass(minutes),
  };
}

function formatLlCell(value: number | boolean | null | undefined): {
  label: string;
  title: string;
  className: string;
} {
  if (value == null || typeof value !== "number") {
    return { label: "—", title: "No samples", className: "bg-slate-50 text-slate-400" };
  }
  const pct = Math.round(value * 100);
  const label = pct >= 100 ? "Gone" : pct <= 0 ? "Open" : `${pct}%`;
  return {
    label,
    title: `${pct}% sold out historically at this hour`,
    className: llHeatClass(value),
  };
}

function formatCharacterCell(value: number | boolean | null | undefined): {
  label: string;
  title: string;
  className: string;
} {
  if (value === true) {
    return {
      label: "Meet",
      title: "Character meet scheduled this hour",
      className: "bg-violet-100 text-violet-900",
    };
  }
  return {
    label: "—",
    title: "No meet scheduled",
    className: "bg-slate-50 text-slate-400",
  };
}

function formatCell(
  variant: HeatmapVariant,
  value: number | boolean | null | undefined,
) {
  if (variant === "wait") return formatWaitCell(value);
  if (variant === "ll-sellout") return formatLlCell(value);
  return formatCharacterCell(value);
}

function HeatmapTableHead({
  rowHeader,
  hours,
}: {
  rowHeader: string;
  hours: number[];
}) {
  return (
    <thead className="bg-slate-50">
      <tr>
        <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 font-semibold text-slate-600">
          {rowHeader}
        </th>
        {hours.map((h) => (
          <th
            key={h}
            className="whitespace-nowrap px-2 py-2 text-center font-medium text-slate-500"
          >
            {formatHourLabel(h)}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TrendsHeatmap({
  rowHeader,
  hours = DEFAULT_TREND_HOURS,
  rows,
  variant,
  emptyMessage = "No data for this selection.",
}: Props) {
  if (rows.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <HeatmapTableHead rowHeader={rowHeader} hours={hours} />
          <tbody>
            <tr>
              <td
                colSpan={hours.length + 1}
                className="px-5 py-10 text-center text-sm text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-xs">
        <HeatmapTableHead rowHeader={rowHeader} hours={hours} />
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="sticky left-0 z-10 max-w-[160px] bg-white px-3 py-2">
                <p className="truncate font-medium text-slate-800">{row.label}</p>
                {row.subtitle ? (
                  <p className="truncate text-[10px] text-slate-500">{row.subtitle}</p>
                ) : null}
              </td>
              {hours.map((h) => {
                const cell = formatCell(variant, row.cells[h]);
                return (
                  <td key={h} className="px-1 py-1 text-center">
                    <span
                      className={`inline-block min-w-[2.25rem] rounded px-1 py-0.5 font-medium ${cell.className}`}
                      title={cell.title}
                    >
                      {cell.label}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function heatmapHoursFromRows(
  rows: Array<{ hourly: Array<{ hour: number }> }>,
  fallback: number[] = DEFAULT_TREND_HOURS,
): number[] {
  const set = new Set<number>();
  for (const row of rows) {
    for (const point of row.hourly) {
      set.add(point.hour);
    }
  }
  if (set.size === 0) return fallback;
  return [...set].sort((a, b) => a - b);
}

export function waitRowsFromAggregates(
  attractions: Array<{
    attraction_id: string;
    attraction_name: string;
    hourly: Array<{ hour: number; p50_wait_minutes: number }>;
  }>,
): TrendsHeatmapRow[] {
  return attractions.map((a) => ({
    id: a.attraction_id,
    label: a.attraction_name,
    cells: Object.fromEntries(
      a.hourly.map((p) => [p.hour, p.p50_wait_minutes]),
    ),
  }));
}

export function llRowsFromAggregates(
  attractions: Array<{
    attraction_id: string;
    attraction_name: string;
    sell_out_hour_p50?: number | null;
    hourly: Array<{ hour: number; sold_out_rate: number }>;
  }>,
): TrendsHeatmapRow[] {
  return attractions.map((a) => ({
    id: a.attraction_id,
    label: a.attraction_name,
    subtitle:
      a.sell_out_hour_p50 != null
        ? `Typical sell-out ~${formatHourLabel(a.sell_out_hour_p50)}`
        : undefined,
    cells: Object.fromEntries(
      a.hourly.map((p) => [p.hour, p.sold_out_rate]),
    ),
  }));
}

export function characterRowsFromGrid(
  characters: Array<{
    character_id: string;
    character_name: string;
    location?: string;
    hourly: Array<{ hour: number; active: boolean }>;
  }>,
): TrendsHeatmapRow[] {
  return characters.map((c) => ({
    id: c.character_id,
    label: c.character_name,
    subtitle: c.location,
    cells: Object.fromEntries(c.hourly.map((p) => [p.hour, p.active])),
  }));
}

export function characterWaitRowsFromAggregates(
  characters: Array<{
    character_id: string;
    character_name: string;
    location?: string;
    hourly: Array<{ hour: number; p50_wait_minutes: number }>;
  }>,
): TrendsHeatmapRow[] {
  return characters.map((c) => ({
    id: c.character_id,
    label: c.character_name,
    subtitle: c.location,
    cells: Object.fromEntries(
      c.hourly.map((p) => [p.hour, p.p50_wait_minutes]),
    ),
  }));
}
