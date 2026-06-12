import type { OperatingHoursEntry, ParkOperatingHours } from "@/lib/api/types";

export type ParkStatusLabel = "Open" | "Closed" | "Unknown";

export interface ParkHoursInfo {
  status: ParkStatusLabel;
  hoursLabel: string;
  todayEntry: OperatingHoursEntry | null;
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatTime12h(time?: string): string {
  if (!time) return "TBD";
  const parts = time.split(":");
  if (parts.length < 2) return time;
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function formatOperatingHoursRange(entry: OperatingHoursEntry): string {
  if (!entry.opening_time || !entry.closing_time) return "Hours TBD";
  return `${formatTime12h(entry.opening_time)} – ${formatTime12h(entry.closing_time)}`;
}

export function isParkOpenNow(entry: OperatingHoursEntry, today = todayIso()): boolean {
  if (entry.date !== today || !entry.opening_time || !entry.closing_time) {
    return false;
  }

  const now = new Date();
  const openParts = entry.opening_time.split(":").map(Number);
  const closeParts = entry.closing_time.split(":").map(Number);
  if (openParts.length < 2 || closeParts.length < 2) return false;

  const open = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    openParts[0],
    openParts[1],
  );
  const close = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    closeParts[0],
    closeParts[1],
  );

  return now >= open && now <= close;
}

export function getParkHoursInfo(
  hours: ParkOperatingHours | null,
): ParkHoursInfo {
  if (!hours?.operating_hours?.length) {
    return { status: "Unknown", hoursLabel: "Hours TBD", todayEntry: null };
  }

  const today = todayIso();
  const todayEntry =
    hours.operating_hours.find((h) => h.date === today) ?? null;

  if (!todayEntry?.opening_time || !todayEntry?.closing_time) {
    return {
      status: todayEntry ? "Closed" : "Unknown",
      hoursLabel: todayEntry ? "Closed" : "Hours TBD",
      todayEntry,
    };
  }

  return {
    status: isParkOpenNow(todayEntry, today) ? "Open" : "Closed",
    hoursLabel: formatOperatingHoursRange(todayEntry),
    todayEntry,
  };
}
