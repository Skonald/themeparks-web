import Image from "next/image";

function PlaceholderPlanUi() {
  const stops = [
    { time: "9:00", name: "Space Mountain", wait: 25, color: "bg-green-500" },
    { time: "10:15", name: "Pirates of the Caribbean", wait: 40, color: "bg-amber-500" },
    { time: "11:30", name: "Big Thunder Mountain", wait: 55, color: "bg-orange-500" },
    { time: "1:00", name: "Lunch break", wait: null, color: "bg-slate-300" },
  ];

  return (
    <div className="flex h-full flex-col bg-slate-50 text-left">
      <div className="bg-brand-accent px-3 py-2.5 text-white">
        <p className="text-[10px] font-medium opacity-90">Magic Kingdom</p>
        <p className="text-sm font-bold">Today&apos;s plan</p>
      </div>
      <div className="flex-1 space-y-2 p-3">
        {stops.map((stop) => (
          <div
            key={stop.name}
            className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold text-brand-primary">
                  {stop.time}
                </p>
                <p className="text-xs font-semibold text-slate-800">{stop.name}</p>
              </div>
              {stop.wait != null && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                  {stop.wait}m
                </span>
              )}
            </div>
            {stop.wait != null && (
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${stop.color}`}
                  style={{ width: `${Math.min(stop.wait, 90)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 bg-white px-3 py-2">
        <p className="text-center text-[10px] font-semibold text-brand-accent">
          Replan when waits change
        </p>
      </div>
    </div>
  );
}

export function PhoneMockup({
  screenshotSrc,
  className = "",
  size = "md",
}: {
  screenshotSrc?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-[200px] h-[400px]",
    md: "w-[240px] h-[480px] sm:w-[260px] sm:h-[520px]",
    lg: "w-[280px] h-[560px] sm:w-[300px] sm:h-[600px]",
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="pointer-events-none absolute inset-4 rounded-[2rem] bg-brand-accent/30 blur-2xl"
        aria-hidden
      />
      <div
        className={`relative mx-auto rounded-[2.25rem] border-[6px] border-slate-800 bg-slate-800 p-1.5 shadow-2xl shadow-blue-950/40 ${sizes[size]}`}
      >
        <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-800" />
        <div className="h-full overflow-hidden rounded-[1.75rem] bg-white">
          {screenshotSrc ? (
            <Image
              src={screenshotSrc}
              alt="Themeparky app preview"
              width={300}
              height={600}
              className="h-full w-full object-cover object-top"
              unoptimized
            />
          ) : (
            <PlaceholderPlanUi />
          )}
        </div>
      </div>
    </div>
  );
}
