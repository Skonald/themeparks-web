import { apiGet } from "./client";
import type { CrowdForecast, ForecastRangeResponse } from "./types";

export async function getForecastRange(
  parkId: string,
  maxDays = 30,
): Promise<CrowdForecast[]> {
  try {
    const data = await apiGet<ForecastRangeResponse>(
      `/api/forecast/${parkId}/range`,
      { max_days: maxDays },
    );
    return data.forecasts ?? [];
  } catch {
    return [];
  }
}

export async function getForecastForDate(
  parkId: string,
  date: string,
): Promise<CrowdForecast | null> {
  try {
    return await apiGet<CrowdForecast>(`/api/forecast/${parkId}`, { date });
  } catch {
    return null;
  }
}

export function crowdLevelColor(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("low")) return "bg-green-500";
  if (l.includes("moderate")) return "bg-amber-500";
  if (l.includes("very")) return "bg-red-600";
  if (l.includes("high")) return "bg-orange-500";
  return "bg-gray-400";
}

export function crowdLevelFromScore(score: number): string {
  if (score <= 3) return "Low";
  if (score <= 6) return "Moderate";
  if (score <= 8) return "High";
  return "Very High";
}
