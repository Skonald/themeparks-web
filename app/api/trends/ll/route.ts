import { NextRequest, NextResponse } from "next/server";
import { getLlAggregates } from "@/lib/api/llAggregates";

export async function GET(request: NextRequest) {
  const parkId = request.nextUrl.searchParams.get("park_id");
  const date = request.nextUrl.searchParams.get("date");
  const dowParam = request.nextUrl.searchParams.get("day_of_week");

  if (!parkId) {
    return NextResponse.json({ error: "park_id required" }, { status: 400 });
  }

  let dayOfWeek: number;
  if (dowParam != null) {
    dayOfWeek = parseInt(dowParam, 10);
  } else if (date) {
    const d = new Date(`${date}T12:00:00`);
    const js = d.getDay();
    dayOfWeek = js === 0 ? 6 : js - 1;
  } else {
    const js = new Date().getDay();
    dayOfWeek = js === 0 ? 6 : js - 1;
  }

  const data = await getLlAggregates(parkId, dayOfWeek);
  if (!data?.attractions?.length) {
    return NextResponse.json(
      { error: "ll aggregates unavailable", attractions: [] },
      { status: 503 },
    );
  }

  return NextResponse.json(data);
}
