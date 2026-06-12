import { formatDisplayDate } from "@/lib/formatUtils";

const EVENT_TYPE_META: Record<
  string,
  { label: string; chip: string; dot: string }
> = {
  early_entry: {
    label: "Early Entry",
    chip: "bg-violet-50 text-violet-800 ring-violet-200/80",
    dot: "bg-violet-500",
  },
  after_hours: {
    label: "After Hours",
    chip: "bg-indigo-50 text-indigo-800 ring-indigo-200/80",
    dot: "bg-indigo-500",
  },
  hard_ticket_party: {
    label: "Ticketed Party",
    chip: "bg-amber-50 text-amber-900 ring-amber-200/80",
    dot: "bg-amber-500",
  },
  extra_hours: {
    label: "Extra Hours",
    chip: "bg-sky-50 text-sky-800 ring-sky-200/80",
    dot: "bg-sky-500",
  },
  special_event: {
    label: "Special Event",
    chip: "bg-rose-50 text-rose-800 ring-rose-200/80",
    dot: "bg-rose-500",
  },
  info: {
    label: "Park Info",
    chip: "bg-slate-100 text-slate-700 ring-slate-200/80",
    dot: "bg-slate-400",
  },
};

export function eventTypeLabel(type?: string): string {
  if (!type) return "Event";
  return (
    EVENT_TYPE_META[type]?.label ??
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function eventTypeChipClass(type?: string): string {
  return (
    EVENT_TYPE_META[type ?? ""]?.chip ??
    "bg-blue-50 text-blue-800 ring-blue-200/80"
  );
}

export function eventTypeDotClass(type?: string): string {
  return EVENT_TYPE_META[type ?? ""]?.dot ?? "bg-blue-500";
}

export function groupEventsByDate<T extends { start_time?: string; start_date?: string }>(
  events: T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const event of events) {
    const iso = eventDateIso(event);
    if (!iso) continue;
    const list = map.get(iso) ?? [];
    list.push(event);
    map.set(iso, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) =>
      (a.start_time ?? "").localeCompare(b.start_time ?? ""),
    );
  }
  return map;
}

/** Park-local time label from ISO like 2026-06-12T08:30:00-04:00 */
export function formatEventTime(iso?: string): string | null {
  if (!iso) return null;
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return null;
  const hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${period}`;
}

export function eventDateIso(event: {
  start_time?: string;
  start_date?: string;
}): string | null {
  if (event.start_time) return event.start_time.slice(0, 10);
  return event.start_date ?? null;
}

export function formatEventWhen(event: {
  start_time?: string;
  end_time?: string;
  start_date?: string;
  end_date?: string;
}): { dateLabel: string; timeLabel: string | null; weekday: string | null } {
  const isoDate = eventDateIso(event);
  const dateLabel = isoDate ? formatDisplayDate(isoDate) : "Date TBD";

  let weekday: string | null = null;
  if (isoDate) {
    try {
      weekday = new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
      });
    } catch {
      weekday = null;
    }
  }

  const start = formatEventTime(event.start_time);
  const end = formatEventTime(event.end_time);
  let timeLabel: string | null = null;
  if (start && end && start !== end) timeLabel = `${start} – ${end}`;
  else if (start) timeLabel = start;

  return { dateLabel, timeLabel, weekday };
}

export function monthGroupKey(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
