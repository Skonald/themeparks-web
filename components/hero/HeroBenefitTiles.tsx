import { HERO_BENEFITS } from "@/lib/heroContent";

type TileTheme = "light" | "dark" | "glass";

export function HeroBenefitTiles({
  theme = "glass",
  className = "",
}: {
  theme?: TileTheme;
  className?: string;
}) {
  const tileClass =
    theme === "light"
      ? "border-slate-200 bg-white text-slate-900"
      : theme === "dark"
        ? "border-white/10 bg-white/5 text-white"
        : "border-white/25 bg-white/15 text-white backdrop-blur-sm";

  const bodyClass =
    theme === "light" ? "text-slate-600" : "text-white/80";

  return (
    <div className={`grid gap-3 sm:grid-cols-3 ${className}`}>
      {HERO_BENEFITS.map((item) => (
        <div key={item.title} className={`rounded-xl border p-4 ${tileClass}`}>
          <p className="font-semibold">{item.title}</p>
          <p className={`mt-1 text-sm leading-snug ${bodyClass}`}>{item.body}</p>
        </div>
      ))}
    </div>
  );
}
