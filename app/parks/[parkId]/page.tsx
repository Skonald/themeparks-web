import { notFound } from "next/navigation";
import { DownloadCTA } from "@/components/DownloadCTA";
import { ParkPageHeader } from "@/components/ParkPageHeader";
import { ParkPills } from "@/components/ParkPills";
import { ParkQuickLinks } from "@/components/ParkQuickLinks";
import { ParkStatusBadge } from "@/components/ParkStatusBadge";
import { ParkSubNav } from "@/components/ParkSubNav";
import { StatCard } from "@/components/StatCard";
import { crowdLevelColor } from "@/lib/api/forecasts";
import { getForecastForDate } from "@/lib/api/forecasts";
import {
  formatParkLocation,
  getParkById,
  getParkOperatingHours,
  getParks,
} from "@/lib/api/parks";
import { getParkWaitTimes } from "@/lib/api/waits";
import { getResortParks } from "@/lib/parkUtils";
import { formatTimeShort } from "@/lib/formatUtils";

export const revalidate = 3600;

export default async function ParkHubPage({
  params,
}: {
  params: Promise<{ parkId: string }>;
}) {
  const { parkId } = await params;
  const park = await getParkById(parkId);
  if (!park) notFound();

  const today = new Date().toISOString().split("T")[0];
  const [hours, waits, todayForecast, allParks] = await Promise.all([
    getParkOperatingHours(parkId),
    getParkWaitTimes(parkId),
    getForecastForDate(parkId, today),
    getParks(200),
  ]);

  const resort = getResortParks(parkId, allParks);

  const openAttractions =
    waits?.attractions?.filter(
      (a) => a.status?.toLowerCase() !== "closed" && a.wait_time_minutes != null,
    ) ?? [];
  const avgWait =
    openAttractions.length > 0
      ? Math.round(
          openAttractions.reduce((s, a) => s + (a.wait_time_minutes ?? 0), 0) /
            openAttractions.length,
        )
      : null;

  return (
    <div className="space-y-8">
      <ParkPageHeader park={park} />
      <ParkStatusBadge hours={hours} />
      {resort && (
        <ParkPills
          groupName={resort.groupName}
          parks={resort.parks}
          activeParkId={parkId}
        />
      )}
      <ParkSubNav parkId={parkId} active="" />

      <div className="grid gap-4 sm:grid-cols-2">
        {avgWait != null && (
          <StatCard
            label="Avg wait (open rides)"
            value={`${avgWait} min`}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            accent="bg-blue-50 text-brand-accent"
          />
        )}
        {todayForecast && (
          <StatCard
            label="Today's crowd"
            value={
              <span className="flex items-center gap-2 text-xl">
                <span
                  className={`inline-block h-3 w-3 rounded-full ${crowdLevelColor(todayForecast.crowd_level)}`}
                />
                {todayForecast.crowd_level}
              </span>
            }
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            accent="bg-amber-50 text-amber-600"
          />
        )}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Explore</h2>
        <ParkQuickLinks parkId={parkId} />
      </section>

      {hours?.operating_hours && hours.operating_hours.length > 0 && (
        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Operating hours</h2>
            <p className="text-sm text-slate-500">
              {formatParkLocation(park) || "Next 7 days"}
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {hours.operating_hours.slice(0, 7).map((h) => (
              <li
                key={h.date}
                className="flex items-center justify-between px-5 py-3 text-sm"
              >
                <span className="font-medium text-slate-800">{h.date}</span>
                <span className="text-slate-600">
                  {formatTimeShort(h.opening_time)} –{" "}
                  {formatTimeShort(h.closing_time)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <DownloadCTA parkId={parkId} className="sticky bottom-4 z-10" />
    </div>
  );
}
