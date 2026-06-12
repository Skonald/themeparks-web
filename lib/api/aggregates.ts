import { apiGet } from "./client";
import type { WaitAggregatesResponse } from "./types";

export async function getWaitAggregates(
  parkId: string,
  dayOfWeek: number,
): Promise<WaitAggregatesResponse | null> {
  try {
    return await apiGet<WaitAggregatesResponse>("/wait-times/aggregates", {
      park_id: parkId,
      day_of_week: dayOfWeek,
      top_attractions: 10,
      hours_start: 9,
      hours_end: 22,
    });
  } catch {
    return null;
  }
}

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const DAY_FULL_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
