import Link from "next/link";
import { AppStoreBadges } from "@/components/hero/AppStoreBadges";
import { HeroPrimaryCta } from "@/components/hero/HeroPrimaryCta";
import { PhoneMockup } from "@/components/hero/PhoneMockup";
import { HERO_COPY } from "@/lib/heroContent";

export function HeroVariantApple({
  className = "",
  headingLevel = "h2",
}: {
  className?: string;
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  return (
    <section
      className={`relative min-h-[520px] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-blue-700 to-blue-900 px-6 py-16 text-white shadow-card sm:px-12 sm:py-20 lg:min-h-[560px] ${className}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-brand-accent/20 blur-2xl" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="max-w-xl text-center lg:flex-1 lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
            {HERO_COPY.eyebrow}
          </p>
          <Heading className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {HERO_COPY.headline}
          </Heading>
          <p className="mt-4 text-lg leading-relaxed text-blue-100">{HERO_COPY.subline}</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <HeroPrimaryCta label={HERO_COPY.ctaPrimary} variant="white" />
            <Link
              href="/download"
              className="text-base font-semibold text-white/90 hover:text-white hover:underline"
            >
              {HERO_COPY.ctaSecondary} →
            </Link>
          </div>
          <AppStoreBadges theme="light" className="mt-6 justify-center lg:justify-start" />
        </div>
        <PhoneMockup size="lg" className="shrink-0 lg:flex-1" />
      </div>
    </section>
  );
}
