import { apiGet } from "./client";
import type { CharacterWaitAggregatesResponse } from "./types";

export async function getCharacterWaitAggregates(
  parkId: string,
  dayOfWeek: number,
): Promise<CharacterWaitAggregatesResponse | null> {
  try {
    return await apiGet<CharacterWaitAggregatesResponse>(
      "/character-meet-greets/wait-aggregates",
      {
        park_id: parkId,
        day_of_week: dayOfWeek,
        top_characters: 10,
        hours_start: 9,
        hours_end: 21,
      },
    );
  } catch {
    return null;
  }
}
