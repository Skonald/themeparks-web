import { notFound } from "next/navigation";
import { DownloadCTA } from "@/components/DownloadCTA";
import { ErrorState } from "@/components/ErrorState";
import { ParkPageHeader } from "@/components/ParkPageHeader";
import { ParkSubNav } from "@/components/ParkSubNav";
import { StaleDataHint } from "@/components/StaleDataHint";
import { WaitsListClient } from "@/components/WaitsListClient";
import { getParkById } from "@/lib/api/parks";
import { getParkWaitTimes } from "@/lib/api/waits";

export const revalidate = 300;

export default async function ParkWaitsPage({
  params,
}: {
  params: Promise<{ parkId: string }>;
}) {
  const { parkId } = await params;
  const park = await getParkById(parkId);
  if (!park) notFound();

  const data = await getParkWaitTimes(parkId);
  const attractions = [...(data?.attractions ?? [])].sort(
    (a, b) => (b.wait_time_minutes ?? -1) - (a.wait_time_minutes ?? -1),
  );

  return (
    <div className="space-y-8">
      <ParkPageHeader park={park} />
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Live wait times</h2>
        <StaleDataHint updatedAt={data?.updated_at} />
      </div>

      <ParkSubNav parkId={parkId} active="waits" />

      {!data ? (
        <ErrorState message="Could not load wait times for this park." />
      ) : attractions.length === 0 ? (
        <div className="card px-6 py-12 text-center text-slate-600">
          No wait data available for this park right now.
        </div>
      ) : (
        <WaitsListClient attractions={attractions} />
      )}

      <DownloadCTA parkId={parkId} headline="Get live replans in the park" />
    </div>
  );
}
