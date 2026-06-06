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
