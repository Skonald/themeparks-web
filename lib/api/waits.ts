import { apiGet } from "./client";
import type { ParkWaitTimesResponse } from "./types";

export async function getParkWaitTimes(
  parkId: string,
): Promise<ParkWaitTimesResponse | null> {
  try {
    return await apiGet<ParkWaitTimesResponse>(
      `/wait-times/park/${parkId}`,
      { stale_after_minutes: 15 },
    );
  } catch {
    return null;
  }
}

export function waitLevelLabel(minutes: number | null | undefined): string {
  if (minutes == null || minutes < 0) return "Unknown";
  if (minutes <= 20) return "Low";
  if (minutes <= 45) return "Moderate";
  if (minutes <= 75) return "High";
  return "Very High";
}

export function waitLevelClass(minutes: number | null | undefined): string {
  if (minutes == null || minutes < 0) return "text-gray-500";
  if (minutes <= 20) return "text-green-600";
  if (minutes <= 45) return "text-amber-600";
  if (minutes <= 75) return "text-orange-600";
  return "text-red-600";
}
