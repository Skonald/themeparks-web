import { notFound } from "next/navigation";
import { TrendsChartClient } from "@/components/TrendsChartClient";
import { getWaitAggregates } from "@/lib/api/aggregates";
import { getCharacterWaitAggregates } from "@/lib/api/characterWaitAggregates";
import { getLlAggregates } from "@/lib/api/llAggregates";
import { getParkById } from "@/lib/api/parks";
import { isoToDayOfWeek, todayIso } from "@/lib/formatUtils";

export const revalidate = 300;

export default async function ParkTrendsPage({
  params,
}: {
  params: Promise<{ parkId: string }>;
}) {
  const { parkId } = await params;
  const park = await getParkById(parkId);
  if (!park) notFound();

  const initialSelectedDate = todayIso();
  const dayOfWeek = isoToDayOfWeek(initialSelectedDate);

  const [initialData, initialLl, initialCharacterWaits] = await Promise.all([
    getWaitAggregates(parkId, dayOfWeek),
    getLlAggregates(parkId, dayOfWeek),
    getCharacterWaitAggregates(parkId, dayOfWeek),
  ]);

  return (
    <TrendsChartClient
      parkId={parkId}
      parkName={park.name}
      initialDay={dayOfWeek}
      initialSelectedDate={initialSelectedDate}
      initialData={initialData}
      initialLl={initialLl}
      initialCharacterWaits={initialCharacterWaits}
    />
  );
}
