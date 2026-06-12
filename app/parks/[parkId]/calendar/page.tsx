import { notFound } from "next/navigation";
import { CrowdCalendarClient } from "@/components/CrowdCalendarClient";
import { ErrorState } from "@/components/ErrorState";
import { getForecastRange } from "@/lib/api/forecasts";
import { getParkById } from "@/lib/api/parks";

export const revalidate = 86400;

export default async function ParkCalendarPage({
  params,
}: {
  params: Promise<{ parkId: string }>;
}) {
  const { parkId } = await params;
  const park = await getParkById(parkId);
  if (!park) notFound();

  const forecasts = await getForecastRange(parkId, 30);

  return (
    <>
      <p className="text-sm text-slate-600">
        Pick the best visit day — tap a date to plan in the app
      </p>

      {forecasts.length === 0 ? (
        <ErrorState message="Forecast data not available for this park." />
      ) : (
        <CrowdCalendarClient
          parkId={parkId}
          parkName={park.name}
          forecasts={forecasts}
        />
      )}
    </>
  );
}
