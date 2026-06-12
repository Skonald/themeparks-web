import Link from "next/link";

const LINKS = [
  {
    slug: "waits",
    label: "Live waits",
    desc: "Current attraction wait times",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "bg-blue-50 text-brand-accent",
  },
  {
    slug: "calendar",
    label: "Crowd calendar",
    desc: "30-day forecast",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    accent: "bg-blue-50 text-brand-primary",
  },
  {
    slug: "trends",
    label: "Trends",
    desc: "Historical wait patterns",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    accent: "bg-amber-50 text-amber-700",
  },
  {
    slug: "events",
    label: "Events",
    desc: "Special hours & parties",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    accent: "bg-rose-50 text-rose-600",
  },
  {
    slug: "characters",
    label: "Character Meets",
    desc: "Meet & greet schedules",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "bg-pink-50 text-pink-600",
  },
  {
    slug: "lightning-lane",
    label: "Lightning Lane",
    desc: "Skip-the-line availability",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    accent: "bg-sky-50 text-brand-accent",
  },
] as const;

export function ParkQuickLinks({ parkId }: { parkId: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {LINKS.map((link) => (
        <Link
          key={link.slug}
          href={`/parks/${parkId}/${link.slug}`}
          className="card-interactive flex items-start gap-4 p-4"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${link.accent}`}
          >
            {link.icon}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{link.label}</p>
            <p className="text-sm text-slate-500">{link.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
