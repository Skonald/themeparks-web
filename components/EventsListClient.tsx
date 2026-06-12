"use client";

import { useEffect, useMemo, useState } from "react";
import type { ParkEvent } from "@/lib/api/types";
import { formatDisplayDate } from "@/lib/formatUtils";
import {
  eventDateIso,
  eventTypeChipClass,
  eventTypeDotClass,
  eventTypeLabel,
  formatEventWhen,
  groupEventsByDate,
} from "@/lib/eventUtils";

type TypeFilter = "All" | string;

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

const LEGEND_TYPES = [
  "early_entry",
  "after_hours",
  "hard_ticket_party",
  "extra_hours",
  "special_event",
] as const;

type CalendarCell =
  | { kind: "pad" }
  | { kind: "muted"; day: number }
  | { kind: "day"; date: string; events: ParkEvent[] };

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

function addDays(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
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

function buildMonthCells(
  year: number,
  month: number,
  byDate: Map<string, ParkEvent[]>,
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
    cells.push({ kind: "day", date: iso, events: byDate.get(iso) ?? [] });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ kind: "pad" });
  }

  return cells;
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

function EventTypeChip({ type }: { type?: string }) {
  if (!type) return null;
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${eventTypeChipClass(type)}`}
    >
      {eventTypeLabel(type)}
    </span>
  );
}

function DayIndicators({ events }: { events: ParkEvent[] }) {
  const types = [...new Set(events.map((e) => e.event_type).filter(Boolean))];
  if (types.length === 0) return null;

  return (
    <div className="mt-0.5 flex items-center justify-center gap-0.5" aria-hidden>
      {types.slice(0, 3).map((type) => (
        <span
          key={type}
          className={`h-1.5 w-1.5 rounded-full ${eventTypeDotClass(type)}`}
        />
      ))}
      {types.length > 3 && (
        <span className="text-[8px] font-semibold leading-none text-slate-400">
          +
        </span>
      )}
    </div>
  );
}

export function EventsListClient({ events }: { events: ParkEvent[] }) {
  const today = todayIso();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const types = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.event_type) set.add(e.event_type);
    });
    return ["All", ...Array.from(set).sort()] as TypeFilter[];
  }, [events]);

  const filtered = useMemo(() => {
    let list = [...events];
    if (typeFilter !== "All") {
      list = list.filter((e) => e.event_type === typeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.description ?? "").toLowerCase().includes(q) ||
          eventTypeLabel(e.event_type).toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => {
      const ad = eventDateIso(a) ?? "";
      const bd = eventDateIso(b) ?? "";
      if (ad !== bd) return ad.localeCompare(bd);
      return (a.start_time ?? "").localeCompare(b.start_time ?? "");
    });
  }, [events, query, typeFilter]);

  const byDate = useMemo(() => groupEventsByDate(filtered), [filtered]);

  const rangeStart = today;
  const rangeEnd = addDays(today, 90);

  const availableMonths = useMemo(
    () => listMonthsInRange(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  );

  const [viewMonth, setViewMonth] = useState<MonthKey>(() =>
    initialViewMonth(availableMonths, today),
  );

  useEffect(() => {
    if (
      !availableMonths.some(
        (m) => m.year === viewMonth.year && m.month === viewMonth.month,
      )
    ) {
      setViewMonth(initialViewMonth(availableMonths, today));
    }
  }, [availableMonths, viewMonth.year, viewMonth.month, today]);

  useEffect(() => {
    setSelectedDate((current) => {
      if (!current) return [...byDate.keys()].sort()[0] ?? null;
      if (!byDate.has(current) && byDate.size > 0) {
        return [...byDate.keys()].sort()[0];
      }
      return current;
    });
  }, [byDate]);

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

  const eventDaysInView = cells.filter(
    (c) => c.kind === "day" && c.events.length > 0,
  ).length;

  const legendTypes = useMemo(() => {
    const present = new Set(filtered.map((e) => e.event_type).filter(Boolean));
    return LEGEND_TYPES.filter((t) => present.has(t));
  }, [filtered]);

  const selectedEvents = selectedDate ? (byDate.get(selectedDate) ?? []) : [];
  const filtersActive = query.trim() !== "" || typeFilter !== "All";

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

  if (events.length === 0) {
    return (
      <div className="card px-6 py-12 text-center">
        <p className="text-lg font-medium text-slate-800">
          No special events in the next 90 days
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Check back closer to your visit for parties, early entry, and after-hours
          nights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events…"
            className="input-field lg:max-w-xs"
            aria-label="Search events"
          />
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`chip ${typeFilter === t ? "chip-active" : "chip-inactive"}`}
              >
                {t === "All" ? "All" : eventTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500">
          {filtersActive
            ? `Showing ${filtered.length} of ${events.length} event${events.length === 1 ? "" : "s"}`
            : `${events.length} event${events.length === 1 ? "" : "s"} in the next 90 days`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-8 text-center text-slate-600">
          No events match your filters.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
          <div className="card p-3 sm:p-4">
            <div className="mb-3 flex items-center gap-1">
              <NavButton label="Previous month" onClick={goPrev} disabled={!canGoPrev} />

              <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
                <label className="sr-only" htmlFor="events-calendar-month">
                  Month
                </label>
                <select
                  id="events-calendar-month"
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

                <label className="sr-only" htmlFor="events-calendar-year">
                  Year
                </label>
                <select
                  id="events-calendar-year"
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
                {eventDaysInView > 0
                  ? `${eventDaysInView} day${eventDaysInView === 1 ? "" : "s"} with events`
                  : "No events this month"}
              </span>
              {legendTypes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {legendTypes.map((type) => (
                    <span key={type} className="flex items-center gap-1">
                      <span
                        className={`h-2 w-2 rounded-full ${eventTypeDotClass(type)}`}
                      />
                      {eventTypeLabel(type)}
                    </span>
                  ))}
                </div>
              )}
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
                  return <div key={`pad-${idx}`} className="h-10" aria-hidden />;
                }

                if (cell.kind === "muted") {
                  return (
                    <div
                      key={`muted-${viewMonth.year}-${viewMonth.month}-${cell.day}`}
                      className="flex h-10 items-center justify-center rounded-md text-xs text-slate-300"
                      aria-hidden
                    >
                      {cell.day}
                    </div>
                  );
                }

                const { date, events: dayEvents } = cell;
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDate === date;
                const isToday = date === today;
                const dayNum = parseIsoDate(date).getDate();

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    title={
                      hasEvents
                        ? `${formatDisplayDate(date)} · ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`
                        : formatDisplayDate(date)
                    }
                    className={`flex h-10 flex-col items-center justify-center rounded-md border transition ${
                      isSelected
                        ? "border-brand-accent bg-brand-accent/10 ring-2 ring-brand-accent"
                        : isToday
                          ? "border-brand-primary/50 bg-white"
                          : hasEvents
                            ? "border-transparent bg-slate-50 hover:bg-slate-100"
                            : "border-transparent bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold leading-none ${
                        isToday ? "text-brand-primary" : "text-slate-800"
                      }`}
                    >
                      {dayNum}
                    </span>
                    <DayIndicators events={dayEvents} />
                  </button>
                );
              })}
            </div>

            <p className="mt-2 text-[11px] text-slate-400">
              Events shown {formatDisplayDate(rangeStart)} –{" "}
              {formatDisplayDate(rangeEnd)}
            </p>
          </div>

          <div className="card p-4 sm:p-5">
            {selectedDate ? (
              <div className="space-y-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {formatDisplayDate(selectedDate)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedEvents.length > 0
                      ? `${selectedEvents.length} event${selectedEvents.length === 1 ? "" : "s"}`
                      : "No special events on this day"}
                  </p>
                </div>

                {selectedEvents.length > 0 ? (
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {selectedEvents.map((event, i) => {
                      const { timeLabel } = formatEventWhen(event);
                      return (
                        <li
                          key={event.event_id ?? `${selectedDate}-${i}`}
                          className="flex items-start justify-between gap-3 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900">{event.name}</p>
                            {timeLabel && (
                              <p className="mt-0.5 text-sm text-slate-600">{timeLabel}</p>
                            )}
                            {event.description &&
                              event.description !== event.name &&
                              event.description.length > 0 && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {event.description}
                                </p>
                              )}
                          </div>
                          <EventTypeChip type={event.event_type} />
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">
                    Pick another date with colored dots, or clear your filters to see
                    more days.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex min-h-[12rem] flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-slate-700">Select a day</p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  Tap a date on the calendar to see parties, early entry, and other
                  special hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
