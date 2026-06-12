"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
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
import { TrendsDateControl } from "@/components/TrendsDateControl";
import {
  characterWaitRowsFromAggregates,
  DEFAULT_TREND_HOURS,
  heatmapHoursFromRows,
  llRowsFromAggregates,
  TrendsHeatmap,
  waitRowsFromAggregates,
} from "@/components/TrendsHeatmap";
import { DAY_FULL_LABELS } from "@/lib/api/aggregates";
import type {
  CharacterWaitAggregatesResponse,
  LLSelloutAggregatesResponse,
  WaitAggregatesResponse,
} from "@/lib/api/types";
import { formatHourLabel, isoToDayOfWeek } from "@/lib/formatUtils";

interface Props {
  parkId: string;
  parkName: string;
  initialDay: number;
  initialSelectedDate: string;
  initialData: WaitAggregatesResponse | null;
  initialLl: LLSelloutAggregatesResponse | null;
  initialCharacterWaits: CharacterWaitAggregatesResponse | null;
}

const EMPTY_LINE_DATA = DEFAULT_TREND_HOURS.map((h) => ({
  hour: formatHourLabel(h),
  p50: null as number | null,
}));

function TrendsSectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-w-0">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function ChartSkeleton({ className = "h-64" }: { className?: string }) {
  return (
    <div
      className={`mt-4 animate-pulse rounded-lg bg-slate-100 ${className}`}
      aria-hidden
    />
  );
}

function TrendsEmptyLineChart({ message }: { message: string }) {
  return (
    <div className="relative mt-4 h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={EMPTY_LINE_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
          <YAxis unit=" min" tick={{ fontSize: 11 }} domain={[0, 60]} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          />
          <Line
            type="monotone"
            dataKey="p50"
            stroke="#cbd5e1"
            strokeDasharray="4 4"
            name="Median wait"
            strokeWidth={1.5}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
        <p className="max-w-md rounded-lg bg-white/90 px-4 py-2 text-center text-sm text-slate-600 shadow-sm ring-1 ring-slate-100">
          {message}
        </p>
      </div>
    </div>
  );
}

function TrendsLineChart({
  chartData,
}: {
  chartData: Array<{ hour: string; p50: number }>;
}) {
  return (
    <div className="mt-4 h-64 w-full">
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
            stroke="#1E88E5"
            name="Median wait"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendsSectionCard({
  children,
  padded = false,
}: {
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <div className={`card overflow-hidden ${padded ? "p-4 sm:p-6" : ""}`}>
      {children}
    </div>
  );
}

export function TrendsChartClient({
  parkId,
  parkName,
  initialDay,
  initialSelectedDate,
  initialData,
  initialLl,
  initialCharacterWaits,
}: Props) {
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [dayOfWeek, setDayOfWeek] = useState(initialDay);
  const [data, setData] = useState(initialData);
  const [llData, setLlData] = useState(initialLl);
  const [characterWaitData, setCharacterWaitData] = useState(initialCharacterWaits);
  const [loading, setLoading] = useState(false);
  const [historicalError, setHistoricalError] = useState<string | null>(
    initialData?.park_hourly?.length
      ? null
      : `No historical wait pattern for ${DAY_FULL_LABELS[initialDay]}s yet.`,
  );
  const [llError, setLlError] = useState<string | null>(
    initialLl?.attractions?.length
      ? null
      : `No Lightning Lane sell-out samples for ${DAY_FULL_LABELS[initialDay]}s yet.`,
  );
  const [characterWaitError, setCharacterWaitError] = useState<string | null>(
    initialCharacterWaits?.characters?.length
      ? null
      : `No character meet wait samples for ${DAY_FULL_LABELS[initialDay]}s yet.`,
  );

  useEffect(() => {
    if (initialCharacterWaits?.characters?.length) return;

    const qs = encodeURIComponent(parkId);
    fetch(
      `/api/trends/character-waits?park_id=${qs}&date=${encodeURIComponent(selectedDate)}`,
    )
      .then(async (res) => {
        if (!res.ok) return;
        const payload = (await res.json()) as CharacterWaitAggregatesResponse;
        if (payload.characters?.length) {
          setCharacterWaitData(payload);
          setCharacterWaitError(null);
        }
      })
      .catch(() => {
        /* keep initial fallback message */
      });
  }, [parkId, selectedDate, initialCharacterWaits]);

  async function loadForDate(iso: string) {
    const dow = isoToDayOfWeek(iso);
    setSelectedDate(iso);
    setDayOfWeek(dow);
    setLoading(true);
    setHistoricalError(null);
    setLlError(null);
    setCharacterWaitError(null);

    try {
      const qs = encodeURIComponent(parkId);
      const [waitRes, llRes, charWaitRes] = await Promise.all([
        fetch(`/api/trends?park_id=${qs}&day_of_week=${dow}`),
        fetch(`/api/trends/ll?park_id=${qs}&date=${encodeURIComponent(iso)}`),
        fetch(`/api/trends/character-waits?park_id=${qs}&date=${encodeURIComponent(iso)}`),
      ]);

      if (waitRes.ok) {
        const payload = (await waitRes.json()) as WaitAggregatesResponse;
        setData(payload);
        if (!payload.park_hourly?.length) {
          setHistoricalError(
            `No historical wait pattern for ${DAY_FULL_LABELS[dow]}s yet.`,
          );
        }
      } else {
        setData(null);
        setHistoricalError(
          waitRes.status === 503
            ? `No historical wait pattern for ${DAY_FULL_LABELS[dow]}s yet.`
            : "Historical wait data not available for this day.",
        );
      }

      if (llRes.ok) {
        const payload = (await llRes.json()) as LLSelloutAggregatesResponse;
        setLlData(payload);
        if (!payload.attractions?.length) {
          setLlError(
            `No Lightning Lane sell-out samples for ${DAY_FULL_LABELS[dow]}s yet.`,
          );
        }
      } else {
        setLlData(null);
        setLlError(
          `No Lightning Lane sell-out samples for ${DAY_FULL_LABELS[dow]}s yet.`,
        );
      }

      if (charWaitRes.ok) {
        const payload = (await charWaitRes.json()) as CharacterWaitAggregatesResponse;
        setCharacterWaitData(payload);
        if (!payload.characters?.length) {
          setCharacterWaitError(
            `No character meet wait samples for ${DAY_FULL_LABELS[dow]}s yet.`,
          );
        }
      } else {
        setCharacterWaitData(null);
        setCharacterWaitError(
          `No character meet wait samples for ${DAY_FULL_LABELS[dow]}s yet.`,
        );
      }
    } catch {
      setData(null);
      setLlData(null);
      setCharacterWaitData(null);
      setHistoricalError("Historical wait data not available for this day.");
      setLlError("Could not load Lightning Lane trends.");
      setCharacterWaitError("Could not load character meet wait trends.");
    } finally {
      setLoading(false);
    }
  }

  const chartData =
    data?.park_hourly?.map((h) => ({
      hour: formatHourLabel(h.hour),
      p50: h.p50_wait_minutes,
    })) ?? [];

  const peak = data?.park_hourly?.reduce(
    (best, h) =>
      h.p50_wait_minutes > (best?.p50_wait_minutes ?? 0) ? h : best,
    data?.park_hourly[0],
  );

  const waitHours = heatmapHoursFromRows(data?.attractions ?? []);
  const llHours = heatmapHoursFromRows(llData?.attractions ?? []);
  const characterWaitHours = heatmapHoursFromRows(
    characterWaitData?.characters ?? [],
  );

  const hasCrowdCurve = chartData.length > 0;
  const hasWaitHeatmap = (data?.attractions.length ?? 0) > 0;
  const hasLlHeatmap = (llData?.attractions.length ?? 0) > 0;
  const hasCharacterWaitHeatmap =
    (characterWaitData?.characters.length ?? 0) > 0;

  const weekdayLabel = DAY_FULL_LABELS[dayOfWeek];
  const allSectionsEmpty =
    !loading &&
    !hasCrowdCurve &&
    !hasWaitHeatmap &&
    !hasLlHeatmap &&
    !hasCharacterWaitHeatmap;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">
            Park Trends &amp; Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-600">{parkName}</p>
          <p className="mt-1 text-xs text-slate-500">
            Pick a visit date — charts show the typical{" "}
            <strong>{weekdayLabel}</strong> pattern from historical data.
          </p>
          {allSectionsEmpty && (
            <p className="mt-2 text-sm text-slate-600">
              No trend data for this weekday yet. Try another day, or see{" "}
              <Link
                href={`/parks/${parkId}/waits`}
                className="font-semibold text-brand-accent hover:underline"
              >
                live waits
              </Link>
              .
            </p>
          )}
        </div>
        <TrendsDateControl
          selectedDate={selectedDate}
          onSelectDate={loadForDate}
          disabled={loading}
          size="compact"
        />
      </div>

      <TrendsSectionCard padded>
        <TrendsSectionHeader
          title="Daily crowd curve (median wait)"
          subtitle={`Typical ${weekdayLabel} pattern at ${parkName}`}
        />
        {loading ? (
          <ChartSkeleton />
        ) : hasCrowdCurve ? (
          <>
            <TrendsLineChart chartData={chartData} />
            {peak && (
              <p className="mt-4 text-sm text-slate-600">
                Typical peak around{" "}
                <strong>{formatHourLabel(peak.hour)}</strong> (
                {Math.round(peak.p50_wait_minutes)} min median) on{" "}
                {weekdayLabel}s.
              </p>
            )}
          </>
        ) : (
          <TrendsEmptyLineChart
            message={
              historicalError ??
              `No historical wait pattern for ${weekdayLabel}s yet.`
            }
          />
        )}
      </TrendsSectionCard>

      <TrendsSectionCard>
        <div className="border-b border-slate-100 px-5 py-4">
          <TrendsSectionHeader
            title="Top attractions"
            subtitle="Median wait by hour (darker = longer)"
          />
        </div>
        {loading ? (
          <div className="px-5 py-6">
            <ChartSkeleton className="h-48" />
          </div>
        ) : (
          <TrendsHeatmap
            rowHeader="Attraction"
            hours={waitHours}
            rows={
              hasWaitHeatmap
                ? waitRowsFromAggregates(data!.attractions)
                : []
            }
            variant="wait"
            emptyMessage={
              historicalError ??
              `No attraction wait samples for ${weekdayLabel}s yet.`
            }
          />
        )}
      </TrendsSectionCard>

      <TrendsSectionCard>
        <div className="border-b border-slate-100 px-5 py-4">
          <TrendsSectionHeader
            title="Lightning Lane sell-outs"
            subtitle={`Multi Pass availability by hour on typical ${weekdayLabel}s (from booking scrape history)`}
          />
        </div>
        {loading ? (
          <div className="px-5 py-6">
            <ChartSkeleton className="h-48" />
          </div>
        ) : (
          <TrendsHeatmap
            rowHeader="Attraction"
            hours={llHours}
            rows={
              hasLlHeatmap ? llRowsFromAggregates(llData!.attractions) : []
            }
            variant="ll-sellout"
            emptyMessage={
              llError ??
              `No Lightning Lane sell-out samples for ${weekdayLabel}s yet.`
            }
          />
        )}
      </TrendsSectionCard>

      <TrendsSectionCard>
        <div className="border-b border-slate-100 px-5 py-4">
          <TrendsSectionHeader
            title="Character meet waits"
            subtitle={`Typical line length by hour on ${weekdayLabel}s (characters only)`}
          />
        </div>
        {loading ? (
          <div className="px-5 py-6">
            <ChartSkeleton className="h-48" />
          </div>
        ) : (
          <TrendsHeatmap
            rowHeader="Character"
            hours={characterWaitHours}
            rows={
              hasCharacterWaitHeatmap
                ? characterWaitRowsFromAggregates(characterWaitData!.characters)
                : []
            }
            variant="wait"
            emptyMessage={
              characterWaitError ??
              `No character meet wait samples for ${weekdayLabel}s yet.`
            }
          />
        )}
      </TrendsSectionCard>

      <DownloadCTA
        parkId={parkId}
        headline="Turn insights into an optimized day"
      />
    </div>
  );
}
