import Link from "next/link";

interface DownloadCTAProps {
  headline?: string;
  parkId?: string;
  date?: string;
  className?: string;
}

export function DownloadCTA({
  headline = "Build your personalized itinerary in the app",
  parkId,
  date,
  className = "",
}: DownloadCTAProps) {
  const params = new URLSearchParams();
  if (parkId) params.set("park", parkId);
  if (date) params.set("date", date);
  const href = `/download${params.toString() ? `?${params}` : ""}`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-brand-accent/20 bg-gradient-to-br from-brand-accent/10 via-white to-brand-primary/5 p-6 sm:p-8 ${className}`}
    >
      <div className="relative z-10 max-w-lg">
        <p className="text-lg font-semibold text-slate-900">{headline}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Save trips, get optimized day plans, and replan live in the park.
          Planning stays in the app — research stays on the web.
        </p>
        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
        >
          Get the app
          <span aria-hidden>→</span>
        </Link>
      </div>
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-primary/10"
        aria-hidden
      />
    </div>
  );
}
