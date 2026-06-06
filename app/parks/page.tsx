import { ErrorState } from "@/components/ErrorState";
import { ParksBrowseClient } from "@/components/ParksBrowseClient";
import { getParks } from "@/lib/api/parks";

export const revalidate = 3600;

export const metadata = {
  title: "Browse Theme Parks — ThemeParks",
  description:
    "Explore theme parks worldwide. Live waits, crowd forecasts, and events.",
};

export default async function BrowseParksPage() {
  const parks = await getParks(200);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="section-title">Browse theme parks</h1>
        <p className="section-subtitle">
          Search and filter parks. Tap a card for waits, calendar, trends, and
          events.
        </p>
      </header>

      {parks.length === 0 ? (
        <ErrorState message="No parks returned from the API. Start the backend on port 5000." />
      ) : (
        <ParksBrowseClient parks={parks} />
      )}
    </div>
  );
}
