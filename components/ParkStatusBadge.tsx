import type { ParkOperatingHours } from "@/lib/api/types";

export function ParkStatusBadge({
  hours,
}: {
  hours: ParkOperatingHours | null;
}) {
  const today = new Date().toISOString().split("T")[0];
  const todayHours = hours?.operating_hours?.find((h) => h.date === today);

  if (!todayHours?.opening_time || !todayHours?.closing_time) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Hours unknown
      </span>
    );
  }

  const now = new Date();
  const open = new Date(`${today}T${todayHours.opening_time}`);
  const close = new Date(`${today}T${todayHours.closing_time}`);
  const isOpen = now >= open && now <= close;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isOpen ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-emerald-500" : "bg-rose-500"}`}
      />
      {isOpen ? "Open now" : "Closed"}
      <span className="font-normal opacity-80">
        · {todayHours.opening_time.slice(0, 5)}–{todayHours.closing_time.slice(0, 5)}
      </span>
    </span>
  );
}
