import { notFound } from "next/navigation";
import { ErrorState } from "@/components/ErrorState";
import { ParkPageHeader } from "@/components/ParkPageHeader";
import { ParkSubNav } from "@/components/ParkSubNav";
import { TrendsChartClient } from "@/components/TrendsChartClient";
import { getWaitAggregates } from "@/lib/api/aggregates";
import { getParkById } from "@/lib/api/parks";

export const revalidate = 3600;

export default async function ParkTrendsPage({
  params,
}: {
  params: Promise<{ parkId: string }>;
}) {
  const { parkId } = await params;
  const park = await getParkById(parkId);
  if (!park) notFound();

  const jsDay = new Date().getDay();
  const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;
  const initialData = await getWaitAggregates(parkId, dayOfWeek);

  return (
    <div className="space-y-8">
      <ParkPageHeader park={park} />
      <p className="-mt-4 text-sm text-slate-600">
        Historical wait patterns — switch day of week to compare
      </p>

      <ParkSubNav parkId={parkId} active="trends" />

      {initialData === null ? (
        <ErrorState message="Historical aggregates not available for this park yet." />
      ) : (
        <TrendsChartClient
          parkId={parkId}
          parkName={park.name}
          initialDay={dayOfWeek}
          initialData={initialData}
        />
      )}
    </div>
  );
}
