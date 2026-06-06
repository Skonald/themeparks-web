"use client";

import { useState } from "react";
import { DownloadCTA } from "@/components/DownloadCTA";
import { crowdLevelColor } from "@/lib/api/forecasts";
import { formatDisplayDate } from "@/lib/formatUtils";
import type { CrowdForecast } from "@/lib/api/types";

interface Props {
  parkId: string;
  parkName: string;
  forecasts: CrowdForecast[];
}

const LEGEND = [
  { label: "Low", color: "bg-green-500" },
  { label: "Moderate", color: "bg-amber-500" },
  { label: "High", color: "bg-orange-500" },
  { label: "Very High", color: "bg-red-600" },
] as const;

function crowdScore(level: string): number {
  const l = level.toLowerCase();
  if (l.includes("very")) return 9;
  if (l.includes("high")) return 7;
  if (l.includes("moderate")) return 5;
  if (l.includes("low")) return 2;
  return 5;
}

function crowdGuidance(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("very") || l.includes("high")) {
    return "Expect longer waits — arrive early or consider a different day.";
  }
  if (l.includes("moderate")) {
    return "A typical day — plan headliners for morning or evening.";
  }
  return "A lighter day — great for fitting more attractions.";
}

export function CrowdCalendarClient({
  parkId,
  parkName,
  forecasts,
}: Props) {
  const [selected, setSelected] = useState<CrowdForecast | null>(null);

  const sorted = [...forecasts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const scores = sorted.map((f) => crowdScore(f.crowd_level));
  const bestIdx = scores.length ? scores.indexOf(Math.min(...scores)) : -1;
  const worstIdx = scores.length ? scores.indexOf(Math.max(...scores)) : -1;

  return (
    <div className="space-y-6">
      {sorted.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {bestIdx >= 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
              <p className="font-semibold text-emerald-900">Best day to visit</p>
              <p className="text-emerald-800">
                {formatDisplayDate(sorted[bestIdx].date)} ·{" "}
                {sorted[bestIdx].crowd_level}
              </p>
            </div>
          )}
          {worstIdx >= 0 && worstIdx !== bestIdx && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm">
              <p className="font-semibold text-rose-900">Busiest day</p>
              <p className="text-rose-800">
                {formatDisplayDate(sorted[worstIdx].date)} ·{" "}
                {sorted[worstIdx].crowd_level}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="card p-4 sm:p-6">
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-10">
          {sorted.map((f) => {
            const isSelected = selected?.date === f.date;
            return (
              <button
                key={f.date}
                type="button"
                onClick={() => setSelected(f)}
                className={`rounded-xl border p-2 text-center transition ${
                  isSelected
                    ? "border-brand-accent bg-brand-accent/5 ring-2 ring-brand-accent"
                    : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`mx-auto mb-1.5 h-9 w-9 rounded-lg ${crowdLevelColor(f.crowd_level)}`}
                  title={f.crowd_level}
                />
                <div className="text-xs font-semibold text-slate-800">
                  {f.date.slice(8)}
                </div>
                <div className="truncate text-[10px] text-slate-500">
                  {f.crowd_level}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded ${item.color}`} />
            {item.label}
          </span>
        ))}
      </div>

      {selected ? (
        <div className="card space-y-4 p-6">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {formatDisplayDate(selected.date)}
            </p>
            <p className="mt-1 flex items-center gap-2 text-slate-700">
              <span
                className={`inline-block h-3 w-3 rounded-full ${crowdLevelColor(selected.crowd_level)}`}
              />
              {selected.crowd_level} crowds at {parkName}
            </p>
            {selected.forecast_accuracy != null && (
              <p className="mt-1 text-sm text-slate-500">
                Forecast confidence: {selected.forecast_accuracy}%
              </p>
            )}
            <p className="mt-3 text-sm text-slate-600">
              {crowdGuidance(selected.crowd_level)}
            </p>
          </div>
          <DownloadCTA
            parkId={parkId}
            date={selected.date}
            headline={`Plan for ${selected.date} in the app`}
          />
        </div>
      ) : (
        <p className="text-center text-sm text-slate-500">
          Tap a day to see guidance and plan in the app.
        </p>
      )}
    </div>
  );
}
