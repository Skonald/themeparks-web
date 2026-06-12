import type { Park } from "@/lib/api/types";
import { getParkRouteId } from "@/lib/parkUtils";

export interface ResortCategory {
  id: string;
  label: string;
  location: string;
  parkSlugs: string[];
}

export interface ResolvedResortCategory extends ResortCategory {
  parks: Park[];
}

export interface TopicCategory {
  id: string;
  label: string;
  pathSuffix: string;
}

export const RESORT_CATEGORIES: ResortCategory[] = [
  {
    id: "walt_disney_world",
    label: "Walt Disney World",
    location: "Orlando, FL",
    parkSlugs: [
      "magic_kingdom",
      "epcot",
      "hollywood_studios",
      "animal_kingdom",
    ],
  },
  {
    id: "disneyland_resort",
    label: "Disneyland Resort",
    location: "Anaheim, CA",
    parkSlugs: ["disneyland", "california_adventure"],
  },
  {
    id: "universal_orlando",
    label: "Universal Orlando",
    location: "Orlando, FL",
    parkSlugs: [
      "universal_studios_florida",
      "islands_of_adventure",
      "epic_universe",
    ],
  },
  {
    id: "universal_hollywood",
    label: "Universal Hollywood",
    location: "Los Angeles, CA",
    parkSlugs: ["universal_studios_hollywood"],
  },
];

export const TOPIC_CATEGORIES: TopicCategory[] = [
  { id: "waits", label: "Live Waits", pathSuffix: "waits" },
  { id: "calendar", label: "Crowd Calendar", pathSuffix: "calendar" },
  { id: "lightning-lane", label: "Lightning Lane", pathSuffix: "lightning-lane" },
  { id: "events", label: "Events", pathSuffix: "events" },
  { id: "characters", label: "Character Meets", pathSuffix: "characters" },
];

export function findParkBySlugOrId(
  parks: Park[],
  slugOrId: string,
): Park | undefined {
  return parks.find(
    (p) => p.park_id === slugOrId || p.slug === slugOrId,
  );
}

export function resolveResortCategories(
  parks: Park[],
): ResolvedResortCategory[] {
  return RESORT_CATEGORIES.map((resort) => ({
    ...resort,
    parks: resort.parkSlugs
      .map((slug) => findParkBySlugOrId(parks, slug))
      .filter((p): p is Park => p != null),
  })).filter((resort) => resort.parks.length > 0);
}

export function topicHref(park: Park, pathSuffix: string): string {
  return `/parks/${getParkRouteId(park)}/${pathSuffix}`;
}
