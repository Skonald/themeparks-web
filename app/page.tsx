import { DownloadCTA } from "@/components/DownloadCTA";
import { ErrorState } from "@/components/ErrorState";
import { FeatureCard } from "@/components/FeatureCard";
import { HomeHero } from "@/components/hero/HomeHero";
import { ParkCard } from "@/components/ParkCard";
import { Button } from "@/components/ui/Button";
import { getAllParks } from "@/lib/api/parks";
import { getFeaturedParks, getParkRouteId } from "@/lib/parkUtils";

export const revalidate = 3600;

export default async function HomePage() {
  const parks = await getAllParks();
  const featured = getFeaturedParks(parks, 6);
  const defaultParkRoute = featured[0] ? getParkRouteId(featured[0]) : null;
  const waitsHref = defaultParkRoute
    ? `/parks/${defaultParkRoute}/waits`
    : "/parks";
  const calendarHref = defaultParkRoute
    ? `/parks/${defaultParkRoute}/calendar`
    : "/parks";

  return (
    <div className="space-y-16 sm:space-y-20">
      <HomeHero />

      <section>
        <h2 className="section-title">Everything you need before you go</h2>
        <p className="section-subtitle">
          Free analytics on the web. Personalized planning in your pocket.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Live waits"
            body="See current attraction wait times before you leave the hotel."
            href={waitsHref}
          />
          <FeatureCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title="Crowd calendar"
            body="Pick the best visit day with 30-day crowd forecasts."
            href={calendarHref}
          />
          <FeatureCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            title="Smart itineraries"
            body="Personalized plans and live replans — in the mobile app."
            href="/download"
          />
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Featured parks</h2>
            <p className="section-subtitle">
              Start with the most popular destinations.
            </p>
          </div>
          <Button href="/parks" variant="ghost" className="text-brand-primary">
            View all parks →
          </Button>
        </div>
        {featured.length === 0 ? (
          <div className="mt-8">
            <ErrorState message="Could not load parks. Is the API running on port 5000?" />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {featured.map((park) => (
              <ParkCard key={park.park_id} park={park} />
            ))}
          </div>
        )}
      </section>

      <DownloadCTA />
    </div>
  );
}
