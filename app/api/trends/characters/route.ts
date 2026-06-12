import { NextRequest, NextResponse } from "next/server";
import { getCharacterHourlyGrid } from "@/lib/api/characterHourly";

export async function GET(request: NextRequest) {
  const parkId = request.nextUrl.searchParams.get("park_id");
  const date = request.nextUrl.searchParams.get("date");

  if (!parkId || !date) {
    return NextResponse.json(
      { error: "park_id and date required" },
      { status: 400 },
    );
  }

  const data = await getCharacterHourlyGrid(parkId, date);
  if (!data?.characters?.length) {
    return NextResponse.json(
      { error: "character grid unavailable", characters: [] },
      { status: 503 },
    );
  }

  return NextResponse.json(data);
}
