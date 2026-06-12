import { notFound } from "next/navigation";
import { DownloadCTA } from "@/components/DownloadCTA";
import { ErrorState } from "@/components/ErrorState";
import { LightningLaneClient } from "@/components/LightningLaneClient";
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
    <>
      <h2 className="text-lg font-semibold text-slate-900">
        Lightning Lane reference
      </h2>

      {!data ? (
        <ErrorState message="Could not load Lightning Lane data." />
      ) : (
        <LightningLaneClient attractions={data.attractions ?? []} />
      )}

      <DownloadCTA
        parkId={parkId}
        headline="Book and optimize Lightning Lane in the app"
      />
    </>
  );
}
