"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { ResolvedResortCategory, TopicCategory } from "@/lib/navCategories";
import { topicHref } from "@/lib/navCategories";
import { getParkRouteId, shortParkName } from "@/lib/parkUtils";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function AccordionSection({
  id,
  label,
  subtitle,
  expandedId,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  subtitle?: string;
  expandedId: string | null;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  const isOpen = expandedId === id;

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-slate-50"
        aria-expanded={isOpen}
        onClick={() => onToggle(id)}
      >
        <span>
          <span className="block text-sm font-semibold text-slate-900">{label}</span>
          {subtitle && (
            <span className="mt-0.5 block text-xs text-slate-500">{subtitle}</span>
          )}
        </span>
        <Chevron open={isOpen} />
      </button>
      {isOpen && <div className="border-t border-slate-50 bg-slate-50/60 pb-2">{children}</div>}
    </div>
  );
}

export function MobileNavMenu({
  resorts,
  topics,
  primaryLinks,
  showCategories = true,
  onClose,
}: {
  resorts: ResolvedResortCategory[];
  topics: TopicCategory[];
  primaryLinks: { href: string; label: string }[];
  showCategories?: boolean;
  onClose: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <nav
      className="nav:hidden max-h-[min(70dvh,32rem)] overflow-y-auto border-t border-slate-100 bg-white"
      aria-label="Mobile navigation"
    >
      <div className="px-2 py-2">
        {primaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {showCategories && (
        <>
          <div className="border-t border-slate-100 px-2 py-1">
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Destinations
            </p>
            {resorts.map((resort) => (
              <AccordionSection
                key={resort.id}
                id={`resort-${resort.id}`}
                label={resort.label}
                subtitle={resort.location}
                expandedId={expandedId}
                onToggle={toggle}
              >
                <ul>
                  {resort.parks.map((park) => (
                    <li key={park.park_id}>
                      <Link
                        href={`/parks/${getParkRouteId(park)}/trends`}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:text-brand-primary"
                        onClick={onClose}
                      >
                        <span>{shortParkName(park.name)}</span>
                        <span className="text-xs text-brand-accent">Overview</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionSection>
            ))}
          </div>

          <div className="border-t border-slate-100 px-2 py-1">
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Explore
            </p>
            {topics.map((topic) => (
              <AccordionSection
                key={topic.id}
                id={`topic-${topic.id}`}
                label={topic.label}
                expandedId={expandedId}
                onToggle={toggle}
              >
                {resorts.map((resort) => (
                  <div key={resort.id} className="py-1">
                    <p className="px-4 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {resort.label}
                    </p>
                    <ul>
                      {resort.parks.map((park) => (
                        <li key={park.park_id}>
                          <Link
                            href={topicHref(park, topic.pathSuffix)}
                            className="block px-4 py-2 text-sm text-slate-700 hover:text-brand-primary"
                            onClick={onClose}
                          >
                            {shortParkName(park.name)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </AccordionSection>
            ))}
          </div>
        </>
      )}

      <div className="space-y-2 border-t border-slate-100 px-4 py-4">
        {showCategories && (
          <Link
            href="/parks"
            className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-accent hover:bg-blue-50"
            onClick={onClose}
          >
            All parks →
          </Link>
        )}
        <Link
          href="/download"
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
          onClick={onClose}
        >
          Get the app
        </Link>
      </div>
    </nav>
  );
}
