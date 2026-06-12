import { NextRequest, NextResponse } from "next/server";
import { getCharacterMeets } from "@/lib/api/characters";

export async function GET(request: NextRequest) {
  const parkId = request.nextUrl.searchParams.get("park_id");
  const date = request.nextUrl.searchParams.get("date");

  if (!parkId || !date) {
    return NextResponse.json(
      { error: "park_id and date required" },
      { status: 400 },
    );
  }

  const meets = await getCharacterMeets(parkId, date);
  return NextResponse.json({ data: meets, total_records: meets.length });
}
