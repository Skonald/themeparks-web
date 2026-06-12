import { apiGet, ApiError } from "./client";
import type {
  Park,
  ParkOperatingHours,
  ParksListResponse,
  ParksPagination,
} from "./types";

const MAX_PAGE_SIZE = 100;
const MAX_PAGES = 50;

async function fetchParksPage(
  page: number,
  limit: number,
  search?: string,
): Promise<{ parks: Park[]; pagination: ParksPagination | null }> {
  try {
    const data = await apiGet<ParksListResponse | Park[]>("/parks", {
      limit,
      page,
      search: search?.trim() || undefined,
    });
    if (Array.isArray(data)) {
      return { parks: data, pagination: null };
    }
    return {
      parks: data.parks ?? [],
      pagination: data.pagination ?? null,
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { parks: [], pagination: null };
    }
    throw err;
  }
}

/** Fetch every park by walking paginated `/parks` responses (API max 100 per page). */
export async function getAllParks(search?: string): Promise<Park[]> {
  const all: Park[] = [];
  let page = 1;

  while (page <= MAX_PAGES) {
    const { parks, pagination } = await fetchParksPage(
      page,
      MAX_PAGE_SIZE,
      search,
    );
    all.push(...parks);

    if (!pagination?.has_next || parks.length === 0) {
      break;
    }
    page += 1;
  }

  return all;
}

export async function getParks(limit = MAX_PAGE_SIZE): Promise<Park[]> {
  const { parks } = await fetchParksPage(1, limit);
  return parks;
}

export async function getParkById(parkId: string): Promise<Park | null> {
  try {
    return await apiGet<Park>(`/parks/${parkId}`);
  } catch {
    return null;
  }
}

export async function getParkOperatingHours(
  parkId: string,
): Promise<ParkOperatingHours | null> {
  try {
    return await apiGet<ParkOperatingHours>(`/operating_hours/${parkId}`);
  } catch {
    return null;
  }
}

export function formatParkLocation(park: Park): string {
  if (typeof park.location === "string" && park.location.trim()) {
    return park.location;
  }
  if (park.location && typeof park.location === "object") {
    const loc = park.location;
    const parts = [loc.city, loc.state, loc.country].filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  if (park.operator) return park.operator;
  if (park.timezone) {
    return park.timezone.replace(/_/g, " ").replace(/\//g, ", ");
  }
  return "";
}
