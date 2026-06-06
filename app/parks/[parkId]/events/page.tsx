import { notFound } from "next/navigation";
import { DownloadCTA } from "@/components/DownloadCTA";
import { EventsListClient } from "@/components/EventsListClient";
import { ParkPageHeader } from "@/components/ParkPageHeader";
import { ParkSubNav } from "@/components/ParkSubNav";
import { getParkEvents } from "@/lib/api/events";
import { getParkById } from "@/lib/api/parks";

export const revalidate = 86400;

export default async function ParkEventsPage({
  params,
}: {
  params: Promise<{ parkId: string }>;
}) {
  const { parkId } = await params;
  const park = await getParkById(parkId);
  if (!park) notFound();

  const events = await getParkEvents(parkId, 90);

  return (
    <div className="space-y-8">
      <ParkPageHeader park={park} />
      <p className="-mt-4 text-sm text-slate-600">
        Special hours, parties, and happenings — next 90 days
      </p>

      <ParkSubNav parkId={parkId} active="events" />

      <EventsListClient events={events} />

      <DownloadCTA
        parkId={parkId}
        headline="See how events affect your plan in the app"
      />
    </div>
  );
}
