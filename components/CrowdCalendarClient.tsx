"use client";

import { useMemo, useState } from "react";
import { DownloadCTA } from "@/components/DownloadCTA";
import { crowdLevelColor } from "@/lib/api/forecasts";
import { formatDisplayDate } from "@/lib/formatUtils";
import type { CrowdForecast } from "@/lib/api/types";

interface Props {
  parkId: string;
  parkName: string;
  forecasts: CrowdForecast[];
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const LEGEND = [
  { label: "Low", color: "bg-green-500" },
  { label: "Moderate", color: "bg-amber-500" },
  { label: "High", color: "bg-orange-500" },
  { label: "Very High", color: "bg-red-600" },
] as const;

type CalendarCell =
  | { kind: "pad" }
  | { kind: "muted"; day: number }
  | { kind: "day"; date: string; forecast: CrowdForecast };

interface MonthKey {
  year: number;
  month: number;
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayIso(): string {
  return toIsoDate(new Date());
}


function listMonthsInRange(rangeStart: string, rangeEnd: string): MonthKey[] {
  const start = parseIsoDate(rangeStart);
  const end = parseIsoDate(rangeEnd);
  const months: MonthKey[] = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1, 12, 0, 0);
  const endCursor = new Date(end.getFullYear(), end.getMonth(), 1, 12, 0, 0);

  while (cursor <= endCursor) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1, 12, 0, 0);
  }

  return months;
}

function initialViewMonth(
  availableMonths: MonthKey[],
  today: string,
): MonthKey {
  const d = parseIsoDate(today);
  const preferred = { year: d.getFullYear(), month: d.getMonth() };
  const match = availableMonths.find(
    (m) => m.year === preferred.year && m.month === preferred.month,
  );
  return match ?? availableMonths[0] ?? preferred;
}

function initialSelectedForecast(
  forecasts: CrowdForecast[],
  today: string,
): CrowdForecast | null {
  return forecasts.find((f) => f.date === today) ?? null;
}

function buildMonthCells(
  year: number,
  month: number,
  byDate: Map<string, CrowdForecast>,
  rangeStart: string,
  rangeEnd: string,
): CalendarCell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  const leadingPads = new Date(year, month, 1, 12, 0, 0).getDay();
  for (let i = 0; i < leadingPads; i += 1) {
    cells.push({ kind: "pad" });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = toIsoDate(new Date(year, month, day, 12, 0, 0));
    if (iso < rangeStart || iso > rangeEnd) {
      cells.push({ kind: "muted", day });
      continue;
    }
    const forecast = byDate.get(iso);
    if (forecast) {
      cells.push({ kind: "day", date: iso, forecast });
    } else {
      cells.push({ kind: "muted", day });
    }
  }

  while (cells.length % 7 !== 0) {
    cells.push({ kind: "pad" });
  }

  return cells;
}

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

function crowdTint(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("low")) return "bg-green-50 hover:bg-green-100";
  if (l.includes("moderate")) return "bg-amber-50 hover:bg-amber-100";
  if (l.includes("very")) return "bg-red-50 hover:bg-red-100";
  if (l.includes("high")) return "bg-orange-50 hover:bg-orange-100";
  return "bg-slate-50 hover:bg-slate-100";
}

function NavButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {label === "Previous month" ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

export function CrowdCalendarClient({
  parkId,
  parkName,
  forecasts,
}: Props) {
  const today = todayIso();

  const sorted = useMemo(
    () =>
      [...forecasts].sort(
        (a, b) => parseIsoDate(a.date).getTime() - parseIsoDate(b.date).getTime(),
      ),
    [forecasts],
  );

  const byDate = useMemo(
    () => new Map(sorted.map((f) => [f.date, f])),
    [sorted],
  );

  const rangeStart = sorted[0]?.date ?? today;
  const rangeEnd = sorted[sorted.length - 1]?.date ?? today;

  const availableMonths = useMemo(
    () => listMonthsInRange(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  );

  const [viewMonth, setViewMonth] = useState<MonthKey>(() =>
    initialViewMonth(availableMonths, today),
  );
  const [selected, setSelected] = useState<CrowdForecast | null>(() =>
    initialSelectedForecast(forecasts, today),
  );

  const viewIndex = availableMonths.findIndex(
    (m) => m.year === viewMonth.year && m.month === viewMonth.month,
  );
  const canGoPrev = viewIndex > 0;
  const canGoNext = viewIndex >= 0 && viewIndex < availableMonths.length - 1;

  const availableYears = useMemo(
    () => [...new Set(availableMonths.map((m) => m.year))].sort((a, b) => a - b),
    [availableMonths],
  );

  const monthOptionsForYear = useMemo(
    () =>
      availableMonths.filter((m) => m.year === viewMonth.year).map((m) => m.month),
    [availableMonths, viewMonth.year],
  );

  const cells = useMemo(
    () => buildMonthCells(viewMonth.year, viewMonth.month, byDate, rangeStart, rangeEnd),
    [viewMonth, byDate, rangeStart, rangeEnd],
  );

  const forecastDaysInView = cells.filter((c) => c.kind === "day").length;

  const scores = sorted.map((f) => crowdScore(f.crowd_level));
  const bestIdx = scores.length ? scores.indexOf(Math.min(...scores)) : -1;
  const worstIdx = scores.length ? scores.indexOf(Math.max(...scores)) : -1;

  function goPrev() {
    if (!canGoPrev) return;
    setViewMonth(availableMonths[viewIndex - 1]);
  }

  function goNext() {
    if (!canGoNext) return;
    setViewMonth(availableMonths[viewIndex + 1]);
  }

  function onMonthChange(nextMonth: number) {
    setViewMonth({ year: viewMonth.year, month: nextMonth });
  }

  function onYearChange(nextYear: number) {
    const monthsForYear = availableMonths.filter((m) => m.year === nextYear);
    const fallback = monthsForYear[0];
    if (!fallback) return;
    const keepMonth = monthsForYear.some((m) => m.month === viewMonth.month);
    setViewMonth(
      keepMonth ? { year: nextYear, month: viewMonth.month } : fallback,
    );
  }

  return (
    <div className="space-y-4">
      {sorted.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {bestIdx >= 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
              <span className="font-semibold text-emerald-900">Best: </span>
              <span className="text-emerald-800">
                {formatDisplayDate(sorted[bestIdx].date)} · {sorted[bestIdx].crowd_level}
              </span>
            </div>
          )}
          {worstIdx >= 0 && worstIdx !== bestIdx && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm">
              <span className="font-semibold text-rose-900">Busiest: </span>
              <span className="text-rose-800">
                {formatDisplayDate(sorted[worstIdx].date)} · {sorted[worstIdx].crowd_level}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
        <div className="card p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-1">
            <NavButton label="Previous month" onClick={goPrev} disabled={!canGoPrev} />

            <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
              <label className="sr-only" htmlFor="calendar-month">
                Month
              </label>
              <select
                id="calendar-month"
                value={viewMonth.month}
                onChange={(e) => onMonthChange(Number(e.target.value))}
                className="max-w-[7.5rem] truncate rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              >
                {monthOptionsForYear.map((month) => (
                  <option key={month} value={month}>
                    {MONTH_NAMES[month]}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="calendar-year">
                Year
              </label>
              <select
                id="calendar-year"
                value={viewMonth.year}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <NavButton label="Next month" onClick={goNext} disabled={!canGoNext} />
          </div>

          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>
              {forecastDaysInView > 0
                ? `${forecastDaysInView} forecast day${forecastDaysInView === 1 ? "" : "s"}`
                : "No forecast this month"}
            </span>
            <div className="flex flex-wrap gap-2">
              {LEGEND.map((item) => (
                <span key={item.label} className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((day, i) => (
              <div
                key={`${day}-${i}`}
                className="py-0.5 text-center text-[10px] font-semibold uppercase text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell, idx) => {
              if (cell.kind === "pad") {
                return <div key={`pad-${idx}`} className="h-9" aria-hidden />;
              }

              if (cell.kind === "muted") {
                return (
                  <div
                    key={`muted-${viewMonth.year}-${viewMonth.month}-${cell.day}`}
                    className="flex h-9 items-center justify-center rounded-md text-xs text-slate-300"
                    aria-hidden
                  >
                    {cell.day}
                  </div>
                );
              }

              const { date, forecast } = cell;
              const isSelected = selected?.date === date;
              const isToday = date === today;
              const dayNum = parseIsoDate(date).getDate();

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelected(forecast)}
                  title={`${formatDisplayDate(date)} · ${forecast.crowd_level}`}
                  className={`flex h-9 flex-col items-center justify-center rounded-md border transition ${
                    isSelected
                      ? "border-brand-accent bg-brand-accent/10 ring-2 ring-brand-accent"
                      : isToday
                        ? "border-brand-primary/50 bg-white"
                        : "border-transparent"
                  } ${crowdTint(forecast.crowd_level)}`}
                >
                  <span
                    className={`text-xs font-semibold leading-none ${
                      isToday ? "text-brand-primary" : "text-slate-800"
                    }`}
                  >
                    {dayNum}
                  </span>
                  <span
                    className={`mt-0.5 h-1.5 w-1.5 rounded-full ${crowdLevelColor(forecast.crowd_level)}`}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            Forecasts available {formatDisplayDate(rangeStart)} –{" "}
            {formatDisplayDate(rangeEnd)}
          </p>
        </div>

        <div className="card p-4 sm:p-5">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {formatDisplayDate(selected.date)}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${crowdLevelColor(selected.crowd_level)}`}
                  />
                  {selected.crowd_level} crowds at {parkName}
                </p>
                {selected.forecast_accuracy != null && (
                  <p className="mt-1 text-xs text-slate-500">
                    Forecast confidence: {selected.forecast_accuracy}%
                  </p>
                )}
                <p className="mt-2 text-sm text-slate-600">
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
            <div className="flex min-h-[12rem] flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-slate-700">Select a day</p>
              <p className="mt-1 max-w-xs text-xs text-slate-500">
                Tap a highlighted date to see crowd guidance and plan your visit in
                the app.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
