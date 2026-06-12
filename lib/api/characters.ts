import { apiGet } from "./client";
import type { CharacterMeet, CharacterMeetsResponse } from "./types";

export async function getCharacterMeets(
  parkId: string,
  date?: string,
): Promise<CharacterMeet[]> {
  try {
    const data = await apiGet<CharacterMeetsResponse>("/character-meet-greets", {
      park_id: parkId,
      date,
    });
    return data.data ?? [];
  } catch {
    return [];
  }
}
