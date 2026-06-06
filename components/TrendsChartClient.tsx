"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DownloadCTA } from "@/components/DownloadCTA";
import { DAY_LABELS } from "@/lib/api/aggregates";
import type { WaitAggregatesResponse } from "@/lib/api/types";

interface Props {
  parkId: string;
  parkName: string;
  initialDay: number;
  initialData: WaitAggregatesResponse | null;
}

function waitHeatClass(minutes: number): string {
  if (minutes <= 20) return "bg-emerald-100 text-emerald-800";
  if (minutes <= 45) return "bg-amber-100 text-amber-800";
  if (minutes <= 75) return "bg-orange-100 text-orange-800";
  return "bg-rose-100 text-rose-800";
}

export function TrendsChartClient({
  parkId,
  parkName,
  initialDay,
  initialData,
}: Props) {
  const [dayOfWeek, setDayOfWeek] = useState(initialDay);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDay(dow: number) {
    setDayOfWeek(dow);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/trends?park_id=${encodeURIComponent(parkId)}&day_of_week=${dow}`,
      );
      if (!res.ok) throw new Error("Failed to load aggregates");
      setData(await res.json());
    } catch {
      setError("Historical data not available for this day.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const chartData =
    data?.park_hourly?.map((h) => ({
      hour: `${h.hour}:00`,
      p50: h.p50_wait_minutes,
    })) ?? [];

  const peak = data?.park_hourly?.reduce(
    (best, h) =>
      h.p50_wait_minutes > (best?.p50_wait_minutes ?? 0) ? h : best,
    data.park_hourly[0],
  );

  const hours =
    data?.attractions[0]?.hourly.map((h) => h.hour) ??
    data?.park_hourly?.map((h) => h.hour) ??
    [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {DAY_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => loadDay(i)}
            className={`chip ${dayOfWeek === i ? "chip-active" : "chip-inactive"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="card animate-pulse h-64 p-6">
          <div className="h-full rounded-lg bg-slate-100" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {!loading && data && chartData.length > 0 && (
        <>
          <div className="card p-4 sm:p-6">
            <h3 className="mb-4 font-semibold text-slate-900">
              Typical wait curve — {DAY_LABELS[dayOfWeek]}s
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis unit=" min" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="p50"
                    stroke="#673AB7"
                    name="Median wait"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {peak && (
              <p className="mt-4 text-sm text-slate-600">
                Typical peak around <strong>{peak.hour}:00</strong> (
                {Math.round(peak.p50_wait_minutes)} min median) on{" "}
                {DAY_LABELS[dayOfWeek]}s at {parkName}.
              </p>
            )}
          </div>

          {data.attractions.length > 0 && hours.length > 0 && (
            <div className="card overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="font-semibold text-slate-900">Top attractions</h3>
                <p className="text-sm text-slate-500">
                  Median wait by hour (darker = longer)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="sticky left-0 bg-slate-50 px-3 py-2 font-semibold text-slate-600">
                        Attraction
                      </th>
                      {hours.map((h) => (
                        <th
                          key={h}
                          className="px-2 py-2 text-center font-medium text-slate-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.attractions.map((a) => (
                      <tr key={a.attraction_id}>
                        <td className="sticky left-0 max-w-[140px] truncate bg-white px-3 py-2 font-medium text-slate-800">
                          {a.attraction_name}
                        </td>
                        {hours.map((h) => {
                          const point = a.hourly.find((x) => x.hour === h);
                          const val = point?.p50_wait_minutes ?? 0;
                          return (
                            <td key={h} className="px-1 py-1 text-center">
                              <span
                                className={`inline-block min-w-[2rem] rounded px-1 py-0.5 font-medium ${waitHeatClass(val)}`}
                                title={`${val} min`}
                              >
                                {val > 0 ? Math.round(val) : "—"}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <DownloadCTA
        parkId={parkId}
        headline="Turn insights into an optimized day"
      />
    </div>
  );
}
