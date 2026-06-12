import { apiGet } from "./client";
import type { LLSelloutAggregatesResponse } from "./types";

export async function getLlAggregates(
  parkId: string,
  dayOfWeek: number,
  bookingType = "MULTI_PASS",
): Promise<LLSelloutAggregatesResponse | null> {
  try {
    return await apiGet<LLSelloutAggregatesResponse>("/wait-times/ll-aggregates", {
      park_id: parkId,
      day_of_week: dayOfWeek,
      booking_type: bookingType,
      top_attractions: 10,
      hours_start: 9,
      hours_end: 21,
    });
  } catch {
    return null;
  }
}
