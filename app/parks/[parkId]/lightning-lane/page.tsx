import { notFound } from "next/navigation";
import { DownloadCTA } from "@/components/DownloadCTA";
import { ErrorState } from "@/components/ErrorState";
import { LightningLaneClient } from "@/components/LightningLaneClient";
import { ParkPageHeader } from "@/components/ParkPageHeader";
import { ParkSubNav } from "@/components/ParkSubNav";
import { StaleDataHint } from "@/components/StaleDataHint";
import { getParkById } from "@/lib/api/parks";
import { getParkWaitTimes } from "@/lib/api/waits";

export const revalidate = 300;

export default async function LightningLanePage({
  params,
}: {
  params: Promise<{ parkId: string }>;
}) {
  const { parkId } = await params;
  const park = await getParkById(parkId);
  if (!park) notFound();

  const data = await getParkWaitTimes(parkId);

  return (
    <div className="space-y-8">
      <ParkPageHeader park={park} />
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Lightning Lane reference
        </h2>
        <StaleDataHint updatedAt={data?.updated_at} />
      </div>

      <ParkSubNav parkId={parkId} active="lightning-lane" />

      {!data ? (
        <ErrorState message="Could not load Lightning Lane data." />
      ) : (
        <LightningLaneClient attractions={data.attractions ?? []} />
      )}

      <DownloadCTA
        parkId={parkId}
        headline="Book and optimize Lightning Lane in the app"
      />
    </div>
  );
}
