import { AppStoreBadges } from "@/components/hero/AppStoreBadges";
import { HeroPrimaryCta } from "@/components/hero/HeroPrimaryCta";
import { HeroProofChips } from "@/components/hero/HeroProofChips";
import { PhoneMockup } from "@/components/hero/PhoneMockup";
import { HERO_COPY } from "@/lib/heroContent";

export function HeroVariantMicrosoft({
  className = "",
  headingLevel = "h2",
}: {
  className?: string;
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  return (
    <section
      className={`relative min-h-[520px] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-blue-700 to-blue-900 px-6 py-12 text-white shadow-card sm:px-10 sm:py-16 lg:min-h-[560px] ${className}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-brand-accent/20 blur-2xl" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:gap-12">
        <div className="order-2 flex-1 text-center lg:order-1 lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
            {HERO_COPY.eyebrow}
          </p>
          <Heading className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {HERO_COPY.headline}
          </Heading>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-blue-100 sm:text-lg">
            {HERO_COPY.subline}
          </p>
          <HeroProofChips theme="dark" className="mt-6 justify-center lg:justify-start" />
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <HeroPrimaryCta label={HERO_COPY.ctaPrimary} variant="white" />
          </div>
          <AppStoreBadges theme="light" className="mt-5 justify-center lg:justify-start" />
          <p className="mt-4 text-xs text-blue-200/80">{HERO_COPY.tagline}</p>
        </div>
        <div className="order-1 flex flex-1 justify-center lg:order-2 lg:justify-end">
          <PhoneMockup size="md" />
        </div>
      </div>
    </section>
  );
}
