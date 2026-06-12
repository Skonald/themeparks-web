import { HeroBenefitTiles } from "@/components/hero/HeroBenefitTiles";
import { HeroPrimaryCta } from "@/components/hero/HeroPrimaryCta";
import { HERO_COPY } from "@/lib/heroContent";

export function HeroVariantDisney({ className = "" }: { className?: string }) {
  return (
    <section
      className={`relative min-h-[560px] overflow-hidden rounded-3xl bg-gradient-to-br from-sky-400 via-brand-primary to-blue-900 px-6 py-14 text-white shadow-card sm:px-10 sm:py-16 ${className}`}
    >
      <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute -right-8 bottom-0 h-56 w-56 rounded-full bg-yellow-200/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-24 w-32 rounded-full bg-white/30 blur-xl" />
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-100">
          {HERO_COPY.tagline}
        </p>
        <h2 className="mt-4 text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-5xl lg:text-6xl">
          Plan your perfect park day
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-50 sm:text-xl">
          Real-time replans · Saved trips · Smart routes — free on iOS &amp;
          Android
        </p>
        <HeroPrimaryCta
          label={`${HERO_COPY.ctaPrimary} →`}
          variant="white"
          className="mt-8 px-10 py-4 text-lg shadow-xl"
        />
        <HeroBenefitTiles theme="glass" className="mt-10 text-left" />
      </div>
    </section>
  );
}
