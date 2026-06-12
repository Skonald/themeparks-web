import { HERO_PROOF_CHIPS } from "@/lib/heroContent";

export function HeroProofChips({
  theme = "dark",
  className = "",
}: {
  theme?: "dark" | "light";
  className?: string;
}) {
  const chipClass =
    theme === "dark"
      ? "border-white/20 bg-white/10 text-blue-100"
      : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {HERO_PROOF_CHIPS.map((label) => (
        <li
          key={label}
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${chipClass}`}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
