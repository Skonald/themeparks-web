"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ResolvedResortCategory, TopicCategory } from "@/lib/navCategories";
import { topicHref } from "@/lib/navCategories";
import { getParkRouteId, shortParkName } from "@/lib/parkUtils";

type OpenMenu = {
  id: string;
  top: number;
  left: number;
};

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
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

function ResortPanel({
  resort,
  onNavigate,
}: {
  resort: ResolvedResortCategory;
  onNavigate: () => void;
}) {
  return (
    <div className="w-72 rounded-xl border border-slate-200 bg-white py-2 shadow-card">
      <div className="border-b border-slate-100 px-4 py-2">
        <p className="font-semibold text-slate-900">{resort.label}</p>
        <p className="text-xs text-slate-500">{resort.location}</p>
      </div>
      <ul className="py-1">
        {resort.parks.map((park) => (
          <li key={park.park_id}>
            <Link
              href={`/parks/${getParkRouteId(park)}/trends`}
              className="flex items-center justify-between px-4 py-2 text-sm hover:bg-slate-50"
              onClick={onNavigate}
            >
              <span className="font-medium text-slate-800">
                {shortParkName(park.name)}
              </span>
              <span className="text-xs text-brand-accent">Overview →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopicPanel({
  topic,
  resorts,
  onNavigate,
}: {
  topic: TopicCategory;
  resorts: ResolvedResortCategory[];
  onNavigate: () => void;
}) {
  return (
    <div className="max-h-96 w-80 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-card">
      <p className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Choose a park · {topic.label}
      </p>
      {resorts.map((resort) => (
        <div key={resort.id} className="border-b border-slate-50 last:border-0">
          <p className="px-4 pt-2 text-xs font-medium text-slate-500">
            {resort.label}
          </p>
          <ul className="pb-1">
            {resort.parks.map((park) => (
              <li key={park.park_id}>
                <Link
                  href={topicHref(park, topic.pathSuffix)}
                  className="block px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  onClick={onNavigate}
                >
                  {shortParkName(park.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function CategoryBar({
  resorts,
  topics,
}: {
  resorts: ResolvedResortCategory[];
  topics: TopicCategory[];
}) {
  const [openMenu, setOpenMenu] = useState<OpenMenu | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const setTriggerRef = useCallback((id: string, node: HTMLButtonElement | null) => {
    if (node) {
      triggerRefs.current.set(id, node);
    } else {
      triggerRefs.current.delete(id);
    }
  }, []);

  const positionMenu = useCallback((id: string) => {
    const trigger = triggerRefs.current.get(id);
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setOpenMenu({ id, top: rect.bottom + 4, left: rect.left });
  }, []);

  const close = useCallback(() => setOpenMenu(null), []);

  const toggleMenu = useCallback(
    (id: string) => {
      if (openMenu?.id === id) {
        close();
        return;
      }
      positionMenu(id);
    },
    [close, openMenu?.id, positionMenu],
  );

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (barRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      close();
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [close]);

  useEffect(() => {
    if (!openMenu) return;

    const updatePosition = () => positionMenu(openMenu.id);

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [openMenu, positionMenu]);

  const openResort = openMenu
    ? resorts.find((resort) => `resort-${resort.id}` === openMenu.id)
    : undefined;
  const openTopic = openMenu
    ? topics.find((topic) => `topic-${topic.id}` === openMenu.id)
    : undefined;

  return (
    <>
      <div
        ref={barRef}
        className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none"
        aria-label="Park categories"
      >
        {resorts.map((resort) => {
          const id = `resort-${resort.id}`;
          const isOpen = openMenu?.id === id;
          return (
            <div key={resort.id} className="relative shrink-0">
              <button
                ref={(node) => setTriggerRef(id, node)}
                type="button"
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  isOpen
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-expanded={isOpen}
                onClick={() => toggleMenu(id)}
              >
                {resort.label}
                <ChevronDown open={isOpen} />
              </button>
            </div>
          );
        })}

        <span
          className="mx-1 hidden h-5 w-px shrink-0 bg-slate-200 sm:block"
          aria-hidden
        />

        {topics.map((topic) => {
          const id = `topic-${topic.id}`;
          const isOpen = openMenu?.id === id;
          return (
            <div key={topic.id} className="relative shrink-0">
              <button
                ref={(node) => setTriggerRef(id, node)}
                type="button"
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  isOpen
                    ? "border-b-2 border-brand-primary text-brand-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-expanded={isOpen}
                onClick={() => toggleMenu(id)}
              >
                {topic.label}
                <ChevronDown open={isOpen} />
              </button>
            </div>
          );
        })}

        <Link
          href="/parks"
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-accent hover:bg-blue-50"
          onClick={close}
        >
          All parks →
        </Link>
      </div>

      {openMenu &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[100]"
            style={{ top: openMenu.top, left: openMenu.left }}
          >
            {openResort && <ResortPanel resort={openResort} onNavigate={close} />}
            {openTopic && (
              <TopicPanel topic={openTopic} resorts={resorts} onNavigate={close} />
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
