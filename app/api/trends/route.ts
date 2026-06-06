import { NextRequest, NextResponse } from "next/server";
import { getWaitAggregates } from "@/lib/api/aggregates";

export async function GET(request: NextRequest) {
  const parkId = request.nextUrl.searchParams.get("park_id");
  const dow = request.nextUrl.searchParams.get("day_of_week");

  if (!parkId) {
    return NextResponse.json({ error: "park_id required" }, { status: 400 });
  }

  const dayOfWeek = dow != null ? parseInt(dow, 10) : new Date().getDay();
  const normalized = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const data = await getWaitAggregates(parkId, normalized);
  if (!data) {
    return NextResponse.json(
      { error: "aggregates unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json(data);
}
