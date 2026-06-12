import { apiGet } from "./client";
import type { CharacterHourlyGridResponse } from "./types";

export async function getCharacterHourlyGrid(
  parkId: string,
  date: string,
): Promise<CharacterHourlyGridResponse | null> {
  try {
    return await apiGet<CharacterHourlyGridResponse>(
      "/character-meet-greets/hourly-grid",
      {
        park_id: parkId,
        date,
        hours_start: 9,
        hours_end: 21,
      },
    );
  } catch {
    return null;
  }
}
