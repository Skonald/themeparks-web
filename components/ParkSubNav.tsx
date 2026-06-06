import Link from "next/link";

const TABS = [
  { slug: "", label: "Overview" },
  { slug: "waits", label: "Waits" },
  { slug: "calendar", label: "Calendar" },
  { slug: "trends", label: "Trends" },
  { slug: "events", label: "Events" },
  { slug: "lightning-lane", label: "Lightning Lane" },
] as const;

export function ParkSubNav({
  parkId,
  active,
}: {
  parkId: string;
  active: string;
}) {
  return (
    <nav
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none"
      aria-label="Park sections"
    >
      {TABS.map((tab) => {
        const href =
          tab.slug === ""
            ? `/parks/${parkId}`
            : `/parks/${parkId}/${tab.slug}`;
        const isActive = active === tab.slug;
        return (
          <Link
            key={tab.slug || "overview"}
            href={href}
            className={`chip shrink-0 ${isActive ? "chip-active" : "chip-inactive"}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
