"use client";

import { useMemo, useState } from "react";
import { TrendsDateControl } from "@/components/TrendsDateControl";
import {
  heatmapHoursFromRows,
  TrendsHeatmap,
  type TrendsHeatmapRow,
} from "@/components/TrendsHeatmap";
import type {
  CharacterHourlyGridResponse,
  CharacterMeet,
  CharacterMeetSchedule,
} from "@/lib/api/types";
import { formatDisplayDate, todayIso } from "@/lib/formatUtils";

type SortKey = "name" | "earliest" | "location";

const CHARACTER_TYPE_LABELS: Record<string, string> = {
  classic: "Classic",
  princess: "Princess",
  pixar: "Pixar",
  star_wars: "Star Wars",
};

function characterTypeLabel(type: string): string {
  return (
    CHARACTER_TYPE_LABELS[type] ??
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function parseTimeMinutes(value?: string): number | null {
  if (!value) return null;
  const parts = value.split(":");
  if (parts.length < 2) return null;
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
}

function earliestStartMinutes(schedules: CharacterMeetSchedule[]): number {
  const mins = schedules
    .map((s) => parseTimeMinutes(s.start_time))
    .filter((n): n is number => n != null);
  return mins.length ? Math.min(...mins) : Number.POSITIVE_INFINITY;
}

function isOutNow(
  meet: CharacterMeet,
  gridRow: { hourly: Array<{ hour: number; active: boolean }> } | undefined,
  nowMins: number,
  currentHour: number,
): boolean {
  if (gridRow?.hourly.some((h) => h.hour === currentHour && h.active)) {
    return true;
  }
  return meet.schedules.some((s) => {
    const start = parseTimeMinutes(s.start_time);
    const end = parseTimeMinutes(s.end_time);
    if (start == null || end == null) return false;
    return start <= nowMins && nowMins < end;
  });
}

function sortMeets(list: CharacterMeet[], sort: SortKey): CharacterMeet[] {
  const sorted = [...list];
  sorted.sort((a, b) => {
    if (sort === "location") {
      const loc = (a.location ?? "").localeCompare(b.location ?? "");
      if (loc !== 0) return loc;
      return a.character_name.localeCompare(b.character_name);
    }
    if (sort === "earliest") {
      const ea = earliestStartMinutes(a.schedules);
      const eb = earliestStartMinutes(b.schedules);
      if (ea !== eb) return ea - eb;
      return a.character_name.localeCompare(b.character_name);
    }
    return a.character_name.localeCompare(b.character_name);
  });
  return sorted;
}

function heatmapRowsFromFiltered(
  meets: CharacterMeet[],
  gridCharacters: CharacterHourlyGridResponse["characters"],
): TrendsHeatmapRow[] {
  const gridById = new Map(gridCharacters.map((c) => [c.character_id, c]));
  const rows: TrendsHeatmapRow[] = [];

  for (const meet of meets) {
    const char = gridById.get(meet.meet_greet_id);
    if (!char) continue;

    const subtitleParts = [
      meet.location,
      meet.character_type ? characterTypeLabel(meet.character_type) : null,
      meet.requires_reservation ? "Reservation" : null,
    ].filter(Boolean);

    rows.push({
      id: char.character_id,
      label: char.character_name,
      subtitle: subtitleParts.join(" · ") || undefined,
      cells: Object.fromEntries(char.hourly.map((p) => [p.hour, p.active])),
    });
  }

  return rows;
}

export function CharacterMeetsClient({
  parkId,
  initialDate,
  initialMeets,
  initialGrid,
}: {
  parkId: string;
  initialDate: string;
  initialMeets: CharacterMeet[];
  initialGrid: CharacterHourlyGridResponse | null;
}) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [meets, setMeets] = useState(initialMeets);
  const [grid, setGrid] = useState(initialGrid);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [outNow, setOutNow] = useState(false);
  const [reservationOnly, setReservationOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("name");

  const dateLabel = formatDisplayDate(selectedDate);
  const isToday = selectedDate === todayIso();
  const hasReservationMeets = meets.some((m) => m.requires_reservation);

  const gridById = useMemo(
    () => new Map((grid?.characters ?? []).map((c) => [c.character_id, c])),
    [grid],
  );

  const types = useMemo(() => {
    const set = new Set<string>();
    meets.forEach((m) => {
      if (m.character_type) set.add(m.character_type);
    });
    return ["All", ...Array.from(set).sort()];
  }, [meets]);

  const filteredMeets = useMemo(() => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const currentHour = now.getHours();

    const list = meets.filter((meet) => {
      if (typeFilter !== "All" && meet.character_type !== typeFilter) {
        return false;
      }
      if (reservationOnly && !meet.requires_reservation) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !meet.character_name.toLowerCase().includes(q) &&
          !(meet.location ?? "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (outNow) {
        if (!isToday) return false;
        const gridRow = gridById.get(meet.meet_greet_id);
        if (!isOutNow(meet, gridRow, nowMins, currentHour)) return false;
      }
      return true;
    });

    return sortMeets(list, sort);
  }, [
    meets,
    typeFilter,
    reservationOnly,
    query,
    outNow,
    isToday,
    gridById,
    sort,
  ]);

  const heatmapRows = useMemo(
    () => heatmapRowsFromFiltered(filteredMeets, grid?.characters ?? []),
    [filteredMeets, grid],
  );

  const scheduleHours = heatmapHoursFromRows(
    filteredMeets
      .map((m) => gridById.get(m.meet_greet_id))
      .filter((c): c is NonNullable<typeof c> => c != null),
  );
  const hasSchedule = !loading && heatmapRows.length > 0;
  const hasAnyData = meets.length > 0;
  const filtersActive =
    query.trim() !== "" ||
    typeFilter !== "All" ||
    outNow ||
    reservationOnly;

  async function loadForDate(iso: string) {
    setSelectedDate(iso);
    setLoading(true);
    try {
      const qs = encodeURIComponent(parkId);
      const [gridRes, meetsRes] = await Promise.all([
        fetch(`/api/trends/characters?park_id=${qs}&date=${encodeURIComponent(iso)}`),
        fetch(`/api/character-meets?park_id=${qs}&date=${encodeURIComponent(iso)}`),
      ]);
      setGrid(gridRes.ok ? await gridRes.json() : null);
      if (meetsRes.ok) {
        const payload = await meetsRes.json();
        setMeets(payload.data ?? []);
      } else {
        setMeets([]);
      }
    } catch {
      setGrid(null);
      setMeets([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {hasAnyData && (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search characters or locations…"
                className="input-field lg:max-w-xs"
                aria-label="Search characters"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="input-field lg:w-44"
                aria-label="Sort by"
              >
                <option value="name">Name A–Z</option>
                <option value="earliest">Earliest meet</option>
                <option value="location">Location A–Z</option>
              </select>
              <div className="flex flex-wrap gap-2">
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`chip ${typeFilter === t ? "chip-active" : "chip-inactive"}`}
                  >
                    {t === "All" ? "All" : characterTypeLabel(t)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setOutNow((v) => !v)}
                  disabled={!isToday}
                  title={
                    isToday
                      ? "Characters meeting right now"
                      : "Out now is only available for today"
                  }
                  className={`chip ${outNow ? "chip-active" : "chip-inactive"} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Out now
                </button>
                {hasReservationMeets && (
                  <button
                    type="button"
                    onClick={() => setReservationOnly((v) => !v)}
                    className={`chip ${reservationOnly ? "chip-active" : "chip-inactive"}`}
                  >
                    Reservation
                  </button>
                )}
              </div>
            </div>
            <TrendsDateControl
              selectedDate={selectedDate}
              onSelectDate={loadForDate}
              disabled={loading}
              size="compact"
            />
          </div>
          <p className="text-sm text-slate-500">
            {filtersActive || filteredMeets.length !== meets.length
              ? `Showing ${filteredMeets.length} of ${meets.length} character${meets.length === 1 ? "" : "s"}`
              : `${meets.length} character${meets.length === 1 ? "" : "s"}`}
          </p>
        </div>
      )}

      {!hasAnyData && (
        <TrendsDateControl
          selectedDate={selectedDate}
          onSelectDate={loadForDate}
          disabled={loading}
          size="compact"
        />
      )}

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Meet schedule</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            When characters are out on {dateLabel}
          </p>
        </div>
        {loading ? (
          <div className="animate-pulse px-5 py-12">
            <div className="h-32 rounded-lg bg-slate-100" />
          </div>
        ) : hasSchedule ? (
          <TrendsHeatmap
            rowHeader="Character"
            hours={scheduleHours}
            rows={heatmapRows}
            variant="character"
            emptyMessage="No character meets match your filters."
          />
        ) : hasAnyData && filtersActive ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No characters match your filters for {dateLabel}.
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No character meets scheduled for {dateLabel}.
          </div>
        )}
      </div>
    </div>
  );
}
