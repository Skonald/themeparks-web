/** Compact 12-hour label for park-hour charts (e.g. 9 → "9AM", 13 → "1PM"). */
export function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}${period}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

/** Backend wait aggregates use Monday=0 through Sunday=6. */
export function isoToDayOfWeek(iso: string): number {
  const jsDay = parseIsoDate(iso).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function shiftIsoDate(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

export function formatDisplayDate(iso: string): string {
  try {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatTimeShort(t?: string): string {
  if (!t) return "—";
  return t.slice(0, 5);
}

export function relativeUpdatedAt(updatedAt?: string): string | null {
  if (!updatedAt) return null;
  try {
    const then = new Date(updatedAt).getTime();
    const mins = Math.round((Date.now() - then) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    return `${hrs} hr ago`;
  } catch {
    return updatedAt;
  }
}
