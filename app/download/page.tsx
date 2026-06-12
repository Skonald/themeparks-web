import Link from "next/link";
import QRCode from "qrcode";
import { AppStoreBadges } from "@/components/hero/AppStoreBadges";
import { HeroPrimaryCta } from "@/components/hero/HeroPrimaryCta";
import { HeroProofChips } from "@/components/hero/HeroProofChips";
import { PhoneMockup } from "@/components/hero/PhoneMockup";
import { getParkById } from "@/lib/api/parks";
import { buildPlanDeepLink } from "@/lib/deepLink";
import { formatDisplayDate } from "@/lib/formatUtils";
import { HERO_COPY, WHY_MOBILE } from "@/lib/heroContent";

interface Props {
  searchParams: Promise<{ park?: string; date?: string }>;
}

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
    color: { dark: "#1E88E5", light: "#FFFFFF" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-blue-700 to-blue-900 px-6 py-12 text-white shadow-card sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
              {HERO_COPY.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {HERO_COPY.headline}
            </h1>
            <p className="mt-4 text-blue-100">{HERO_COPY.subline}</p>
            <HeroProofChips theme="dark" className="mt-6 justify-center lg:justify-start" />
            <div className="mt-8 flex justify-center lg:justify-start">
              <HeroPrimaryCta label={HERO_COPY.ctaPrimary} variant="white" />
            </div>
            <AppStoreBadges theme="light" className="mt-5 justify-center lg:justify-start" />

            {parkName && (
              <div className="mx-auto mt-6 max-w-md rounded-2xl bg-white/15 px-5 py-4 backdrop-blur-sm lg:mx-0">
                <p className="text-sm text-blue-100">Continue planning for</p>
                <p className="text-lg font-semibold">{parkName}</p>
                {date && (
                  <p className="mt-1 text-sm text-blue-200">
                    {formatDisplayDate(date)}
                  </p>
                )}
              </div>
            )}
          </div>
          <PhoneMockup size="sm" className="hidden shrink-0 sm:block" />
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="card flex flex-col items-center p-8 text-center">
          <p className="font-semibold text-slate-900">Scan to open the app</p>
          <p className="mt-1 text-sm text-slate-500">
            Encodes your plan handoff link
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR code for Themeparky app"
            width={220}
            height={220}
            className="mt-6 rounded-2xl border border-slate-200 shadow-card"
          />
          <p className="mt-4 break-all text-xs text-slate-400">{deepLink}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-slate-900">Get the app</h2>
            <AppStoreBadges theme="dark" className="mt-4" />
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
          Use Themeparky in the browser to research before you install — no login
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
