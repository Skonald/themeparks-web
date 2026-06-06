import Image from "next/image";
import Link from "next/link";
import { DownloadCTA } from "@/components/DownloadCTA";
import { ErrorState } from "@/components/ErrorState";
import { FeatureCard } from "@/components/FeatureCard";
import { ParkCard } from "@/components/ParkCard";
import { Button } from "@/components/ui/Button";
import { getParks } from "@/lib/api/parks";
import { getFeaturedParks } from "@/lib/parkUtils";

export const revalidate = 3600;

export default async function HomePage() {
  const parks = await getParks(100);
  const featured = getFeaturedParks(parks, 6);

  return (
    <div className="space-y-16 sm:space-y-20">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-violet-700 to-indigo-900 px-6 py-12 text-white shadow-card sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-brand-accent/20 blur-2xl" />
        <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-center md:text-left">
          <Image
            src="/themeparky_logo.png"
            alt="ThemeParks"
            width={112}
            height={112}
            className="shrink-0 drop-shadow-lg"
            priority
          />
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-200">
              Theme park intelligence
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Plan Smarter, Play Harder
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-violet-100 sm:text-lg">
              Research live waits, crowd calendars, and trends — then build your
              optimized day in the mobile app.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                href="/download"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-primary shadow-sm transition hover:bg-violet-50"
              >
                Get the app
              </Link>
              <Link
                href="/parks"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Browse parks
              </Link>
            </div>
          </div>
        </div>
      </section>

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
          />
          <FeatureCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title="Crowd calendar"
            body="Pick the best visit day with 30-day crowd forecasts."
          />
          <FeatureCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            title="Smart itineraries"
            body="Personalized plans and live replans — in the mobile app."
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
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
