import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { getParkById } from "@/lib/api/parks";
import { buildPlanDeepLink } from "@/lib/deepLink";
import { formatDisplayDate } from "@/lib/formatUtils";

interface Props {
  searchParams: Promise<{ park?: string; date?: string }>;
}

const WHY_MOBILE = [
  {
    title: "Saved trips",
    body: "Pick up planning where you left off — across devices.",
  },
  {
    title: "Personalized itineraries",
    body: "Preferences, heights, Lightning Lane, and breaks baked in.",
  },
  {
    title: "Live replan",
    body: "GPS-aware adjustments when waits change in the park.",
  },
  {
    title: "Push alerts",
    body: "Trip reminders and replan nudges (coming soon).",
  },
] as const;

const WHY_WEB = [
  "Live wait times",
  "30-day crowd calendar",
  "Historical trends",
  "Park events & hours",
] as const;

export default async function DownloadPage({ searchParams }: Props) {
  const { park: parkId, date } = await searchParams;
  let parkName: string | null = null;
  if (parkId) {
    const park = await getParkById(parkId);
    parkName = park?.name ?? parkId;
  }

  const deepLink = buildPlanDeepLink(parkId, date);
  const qrDataUrl = await QRCode.toDataURL(deepLink, {
    margin: 2,
    width: 220,
    color: { dark: "#4A148C", light: "#FFFFFF" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-violet-700 to-indigo-900 px-6 py-10 text-center text-white sm:px-12">
        <Image
          src="/themeparky_logo.png"
          alt="ThemeParks"
          width={88}
          height={88}
          className="mx-auto drop-shadow-lg"
        />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Plan your perfect park day
        </h1>
        <p className="mx-auto mt-3 max-w-md text-violet-100">
          Research on the web. Optimize your day in the app.
        </p>

        {parkName && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl bg-white/15 px-5 py-4 backdrop-blur-sm">
            <p className="text-sm text-violet-100">Continue planning for</p>
            <p className="text-lg font-semibold">{parkName}</p>
            {date && (
              <p className="mt-1 text-sm text-violet-200">
                {formatDisplayDate(date)}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="card flex flex-col items-center p-8 text-center">
          <p className="font-semibold text-slate-900">Scan to open the app</p>
          <p className="mt-1 text-sm text-slate-500">
            Encodes your plan handoff link
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR code for ThemeParks app"
            width={220}
            height={220}
            className="mt-6 rounded-2xl border border-slate-200 shadow-card"
          />
          <p className="mt-4 break-all text-xs text-slate-400">{deepLink}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-slate-900">Get the app</h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <span className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                App Store — coming soon
              </span>
              <span className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-white">
                Google Play — coming soon
              </span>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">Why mobile?</h2>
            <ul className="mt-3 space-y-3">
              {WHY_MOBILE.map((item) => (
                <li key={item.title} className="flex gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary">
                    ✓
                  </span>
                  <span>
                    <strong className="text-slate-900">{item.title}</strong>
                    <span className="text-slate-600"> — {item.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card mt-8 p-6">
        <h2 className="font-semibold text-slate-900">What you can do on the web</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use ThemeParks in the browser to research before you install — no login
          required.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {WHY_WEB.map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
            >
              {item}
            </span>
          ))}
        </div>
        <Link
          href="/parks"
          className="mt-6 inline-flex text-sm font-semibold text-brand-primary hover:underline"
        >
          Browse parks on the web →
        </Link>
      </div>
    </div>
  );
}
