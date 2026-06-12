import Link from "next/link";

export const PARK_TABS = [
  { slug: "trends", label: "Trends" },
  { slug: "waits", label: "Waits" },
  { slug: "lightning-lane", label: "Lightning Lane" },
  { slug: "characters", label: "Characters" },
  { slug: "events", label: "Events" },
  { slug: "calendar", label: "Crowd Calendar" },
] as const;

export type ParkTabSlug = (typeof PARK_TABS)[number]["slug"];

export function ParkSubNav({
  parkId,
  active,
}: {
  parkId: string;
  active: ParkTabSlug;
}) {
  return (
    <nav
      className="overflow-x-auto rounded-xl bg-slate-100/90 p-1 scrollbar-none"
      aria-label="Park sections"
    >
      <div className="flex min-w-min gap-1">
        {PARK_TABS.map((tab) => {
          const isActive = active === tab.slug;
          return (
            <Link
              key={tab.slug}
              href={`/parks/${parkId}/${tab.slug}`}
              className={`chip-tab ${isActive ? "chip-tab-active" : "chip-tab-inactive"}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
