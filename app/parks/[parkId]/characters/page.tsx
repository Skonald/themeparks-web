import { notFound } from "next/navigation";
import { CharacterMeetsClient } from "@/components/CharacterMeetsClient";
import { DownloadCTA } from "@/components/DownloadCTA";
import { getCharacterHourlyGrid } from "@/lib/api/characterHourly";
import { getCharacterMeets } from "@/lib/api/characters";
import { getParkById } from "@/lib/api/parks";
import { todayIso } from "@/lib/formatUtils";

export const revalidate = 3600;

export default async function ParkCharactersPage({
  params,
}: {
  params: Promise<{ parkId: string }>;
}) {
  const { parkId } = await params;
  const park = await getParkById(parkId);
  if (!park) notFound();

  const initialDate = todayIso();
  const [meets, grid] = await Promise.all([
    getCharacterMeets(parkId, initialDate),
    getCharacterHourlyGrid(parkId, initialDate),
  ]);

  return (
    <>
      <p className="text-sm text-slate-600">
        Character meet schedules and times — pick a date to plan your stops
      </p>

      <CharacterMeetsClient
        parkId={parkId}
        initialDate={initialDate}
        initialMeets={meets}
        initialGrid={grid}
      />

      <DownloadCTA
        parkId={parkId}
        headline="Plan character stops in your itinerary — in the app"
      />
    </>
  );
}
