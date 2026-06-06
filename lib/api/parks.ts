import { apiGet } from "./client";
import type { Park, ParkOperatingHours, ParksListResponse } from "./types";

export async function getParks(limit = 50): Promise<Park[]> {
  try {
    const data = await apiGet<ParksListResponse | Park[]>("/parks", {
      limit,
      page: 1,
    });
    if (Array.isArray(data)) return data;
    return data.parks ?? [];
  } catch {
    return [];
  }
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
