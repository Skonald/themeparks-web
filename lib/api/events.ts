import { apiGet } from "./client";
import type { ParkEvent } from "./types";

export async function getParkEvents(
  parkId: string,
  days = 90,
): Promise<ParkEvent[]> {
  try {
    const data = await apiGet<{ events?: ParkEvent[] } | ParkEvent[]>(
      `/api/events/${parkId}`,
      { days },
    );
    if (Array.isArray(data)) return data;
    return data.events ?? [];
  } catch {
    return [];
  }
}
