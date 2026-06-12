"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { DAY_FULL_LABELS } from "@/lib/api/aggregates";
import {
  formatDisplayDate,
  isoToDayOfWeek,
  parseIsoDate,
  shiftIsoDate,
  todayIso,
  toIsoDate,
} from "@/lib/formatUtils";

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

interface MonthKey {
  year: number;
  month: number;
}

interface Props {
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  disabled?: boolean;
  /** Smaller padding for section headers */
  size?: "default" | "compact";
}

function monthFromIso(iso: string): MonthKey {
  const d = parseIsoDate(iso);
  return { year: d.getFullYear(), month: d.getMonth() };
}

function buildMonthCells(year: number, month: number): (number | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingPads = new Date(year, month, 1, 12, 0, 0).getDay();
  const cells: (number | null)[] = [];

  for (let i = 0; i < leadingPads; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function TrendsCalendarPanel({
  selectedDate,
  onSelectDate,
  onClose,
  disabled,
}: {
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  onClose: () => void;
  disabled?: boolean;
}) {
  const today = todayIso();
  const [viewMonth, setViewMonth] = useState<MonthKey>(() =>
    monthFromIso(selectedDate),
  );

  const cells = useMemo(
    () => buildMonthCells(viewMonth.year, viewMonth.month),
    [viewMonth],
  );

  const yearOptions = useMemo(() => {
    const anchor = viewMonth.year;
    const years: number[] = [];
    for (let y = anchor - 2; y <= anchor + 2; y += 1) {
      years.push(y);
    }
    return years;
  }, [viewMonth.year]);

  function selectDay(day: number) {
    if (disabled) return;
    const iso = toIsoDate(new Date(viewMonth.year, viewMonth.month, day, 12, 0, 0));
    onSelectDate(iso);
    onClose();
  }

  return (
    <div className="w-[min(100vw-2rem,18rem)] p-3">
      <div className="mb-2 flex items-center gap-1">
        <IconButton
          label="Previous month"
          disabled={disabled}
          onClick={() =>
            setViewMonth((current) => {
              const d = new Date(current.year, current.month - 1, 1, 12, 0, 0);
              return { year: d.getFullYear(), month: d.getMonth() };
            })
          }
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </IconButton>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
          <select
            aria-label="Month"
            value={viewMonth.month}
            disabled={disabled}
            onChange={(e) =>
              setViewMonth((current) => ({ ...current, month: Number(e.target.value) }))
            }
            className="max-w-[6.5rem] truncate rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs font-semibold text-slate-900"
          >
            {MONTH_NAMES.map((name, month) => (
              <option key={name} value={month}>
                {name}
              </option>
            ))}
          </select>
          <select
            aria-label="Year"
            value={viewMonth.year}
            disabled={disabled}
            onChange={(e) =>
              setViewMonth((current) => ({ ...current, year: Number(e.target.value) }))
            }
            className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs font-semibold text-slate-900"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <IconButton
          label="Next month"
          disabled={disabled}
          onClick={() =>
            setViewMonth((current) => {
              const d = new Date(current.year, current.month + 1, 1, 12, 0, 0);
              return { year: d.getFullYear(), month: d.getMonth() };
            })
          }
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </IconButton>
      </div>

      <div className="mb-0.5 grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((day, i) => (
          <div
            key={`${day}-${i}`}
            className="py-0.5 text-center text-[9px] font-semibold uppercase text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`pad-${idx}`} className="h-8" aria-hidden />;
          }

          const iso = toIsoDate(
            new Date(viewMonth.year, viewMonth.month, day, 12, 0, 0),
          );
          const isSelected = iso === selectedDate;
          const isToday = iso === today;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => selectDay(day)}
              aria-pressed={isSelected}
              className={`flex h-8 items-center justify-center rounded-md border text-xs font-semibold transition disabled:opacity-50 ${
                isSelected
                  ? "border-brand-accent bg-brand-accent text-white"
                  : isToday
                    ? "border-brand-primary/40 text-brand-primary hover:bg-slate-50"
                    : "border-transparent text-slate-800 hover:bg-slate-100"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TrendsDateControl({
  selectedDate,
  onSelectDate,
  disabled = false,
  size = "default",
}: Props) {
  const today = todayIso();
  const popoverId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const dayOfWeek = isoToDayOfWeek(selectedDate);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [selectedDate]);

  const pad = size === "compact" ? "py-1" : "py-1.5";

  return (
    <div ref={rootRef} className="relative inline-flex max-w-full flex-col items-end gap-1">
      <div
        className={`inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white px-1 ${pad} shadow-sm`}
      >
        <IconButton
          label="Previous day"
          disabled={disabled}
          onClick={() => onSelectDate(shiftIsoDate(selectedDate, -1))}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </IconButton>

        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-controls={popoverId}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-w-0 items-center gap-1 rounded-md px-2 py-1 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
        >
          <span className="truncate">{formatDisplayDate(selectedDate)}</span>
          <span className="hidden text-xs font-normal text-slate-500 sm:inline">
            · {DAY_FULL_LABELS[dayOfWeek]}
          </span>
          <svg
            className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <IconButton
          label="Next day"
          disabled={disabled}
          onClick={() => onSelectDate(shiftIsoDate(selectedDate, 1))}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </IconButton>

        <button
          type="button"
          disabled={disabled || selectedDate === today}
          onClick={() => onSelectDate(today)}
          className="chip chip-inactive hidden px-2 py-1 text-xs sm:inline-flex disabled:opacity-40"
        >
          Today
        </button>
      </div>

      {open && (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Choose date"
          className="absolute right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <TrendsCalendarPanel
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onClose={() => setOpen(false)}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
