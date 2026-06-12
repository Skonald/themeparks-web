import type { Park } from "@/lib/api/types";

export type ParkOperatorFilter =
  | "All"
  | "Disney"
  | "Universal"
  | "Six Flags"
  | "Other";

const FEATURED_PARK_IDS = [
  "magic_kingdom",
  "epcot",
  "hollywood_studios",
  "animal_kingdom",
  "universal_studios_florida",
  "islands_of_adventure",
] as const;

export function getParkRouteId(park: Park): string {
  return park.slug ?? park.park_id;
}

/** Resort / campus groups for park pill switcher (from Flutter park_details). */
export const PARK_RESORT_GROUPS: Record<string, string[]> = {
  "Walt Disney World": [
    "magic_kingdom",
    "epcot",
    "animal_kingdom",
    "hollywood_studios",
  ],
  "Disneyland Resort": ["disneyland", "california_adventure"],
  "Universal Orlando": [
    "universal_studios_florida",
    "islands_of_adventure",
    "epic_universe",
  ],
  "Universal Hollywood": ["universal_studios_hollywood"],
};

export function shortParkName(name: string): string {
  return name.replace(/Park|Theme Park|Disney's /gi, "").trim() || name;
}

export function parkMatchesSlugOrId(park: Park, slugOrId: string): boolean {
  return park.park_id === slugOrId || park.slug === slugOrId;
}

export function getResortParks(
  parkId: string,
  allParks: Park[],
): { groupName: string; parks: Park[] } | null {
  for (const [groupName, ids] of Object.entries(PARK_RESORT_GROUPS)) {
    const parks = ids
      .map((id) => allParks.find((p) => parkMatchesSlugOrId(p, id)))
      .filter((p): p is Park => p != null);
    const isInGroup = parks.some((p) => parkMatchesSlugOrId(p, parkId));
    if (isInGroup && parks.length > 1) return { groupName, parks };
  }
  return null;
}

export function getParkOperatorCategory(park: Park): ParkOperatorFilter {
  const name = park.name.toLowerCase();
  const operator = (park.operator ?? "").toLowerCase();

  if (
    operator === "disney" ||
    name.includes("disney") ||
    name.includes("magic kingdom") ||
    name.includes("epcot") ||
    name.includes("hollywood") ||
    name.includes("animal kingdom")
  ) {
    return "Disney";
  }
  if (operator === "universal" || name.includes("universal")) {
    return "Universal";
  }
  if (operator.includes("six flags") || name.includes("six flags")) {
    return "Six Flags";
  }
  return "Other";
}

export function searchParks(parks: Park[], query: string, limit = 5): Park[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return parks
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.operator ?? "").toLowerCase().includes(q) ||
        (p.slug ?? "").toLowerCase().includes(q),
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function filterParks(
  parks: Park[],
  query: string,
  operator: ParkOperatorFilter,
): Park[] {
  let result = parks;

  if (operator !== "All") {
    result = result.filter((p) => getParkOperatorCategory(p) === operator);
  }

  const q = query.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.operator ?? "").toLowerCase().includes(q),
    );
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function getFeaturedParks(parks: Park[], limit = 6): Park[] {
  const byId = FEATURED_PARK_IDS.map((id) =>
    parks.find((p) => p.park_id === id || p.slug === id),
  ).filter((p): p is Park => p != null);

  if (byId.length >= 4) return byId.slice(0, limit);

  const disney = parks.filter((p) => getParkOperatorCategory(p) === "Disney");
  const universal = parks.filter(
    (p) => getParkOperatorCategory(p) === "Universal",
  );
  return [...disney, ...universal].slice(0, limit);
}

export function operatorGradient(park: Park): string {
  switch (getParkOperatorCategory(park)) {
    case "Disney":
      return "from-blue-700 via-blue-600 to-sky-500";
    case "Universal":
      return "from-blue-800 via-blue-600 to-red-600";
    case "Six Flags":
      return "from-red-700 via-red-600 to-amber-500";
    default:
      return "from-slate-700 via-slate-600 to-brand-primary";
  }
}

export function operatorBadgeClass(park: Park): string {
  switch (getParkOperatorCategory(park)) {
    case "Disney":
      return "bg-blue-100 text-blue-800";
    case "Universal":
      return "bg-blue-100 text-blue-800";
    case "Six Flags":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
