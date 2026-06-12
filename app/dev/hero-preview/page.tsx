import { HeroVariantApple } from "@/components/hero/HeroVariantApple";
import { HeroVariantDisney } from "@/components/hero/HeroVariantDisney";
import { HeroVariantMicrosoft } from "@/components/hero/HeroVariantMicrosoft";

export const metadata = {
  title: "Hero preview — Themeparky",
  robots: { index: false, follow: false },
};

const variants = [
  {
    id: "apple",
    label: "Variant 1 — Apple (minimal, dark, phone)",
    component: HeroVariantApple,
  },
  {
    id: "microsoft",
    label: "Variant 2 — Microsoft (split, phone) — default for home",
    component: HeroVariantMicrosoft,
  },
  {
    id: "disney",
    label: "Variant 3 — Disney (promotional tiles, no phone)",
    component: HeroVariantDisney,
  },
] as const;

export default function HeroPreviewPage() {
  return (
    <div className="space-y-12 pb-16">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Hero preview</h1>
        <p className="text-slate-600">
          Compare three conversion-focused hero layouts. Home uses Variant 2
          (Microsoft) by default.
        </p>
      </header>

      {variants.map(({ id, label, component: Variant }) => (
        <div key={id} className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <Variant />
        </div>
      ))}
    </div>
  );
}
