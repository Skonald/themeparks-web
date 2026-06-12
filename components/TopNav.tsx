"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CategoryBar } from "@/components/CategoryBar";
import { GlobalSearchClient } from "@/components/GlobalSearchClient";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { Button } from "@/components/ui/Button";
import type {
  ResolvedResortCategory,
  TopicCategory,
} from "@/lib/navCategories";
import type { Park } from "@/lib/api/types";

const links = [
  { href: "/", label: "Home" },
  { href: "/parks", label: "Parks" },
];

function shouldHideCategoryBar(pathname: string): boolean {
  return /^\/parks\/[^/]+/.test(pathname);
}

export function TopNav({
  parks,
  featuredParks,
  resorts,
  topics,
}: {
  parks: Park[];
  featuredParks: Park[];
  resorts: ResolvedResortCategory[];
  topics: TopicCategory[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hideCategoryBar = shouldHideCategoryBar(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 880px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-nav backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-3 py-3">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/themeparky_logo_symbol.png"
              alt=""
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="hidden text-lg font-bold tracking-tight text-brand-primary sm:inline">
              Themeparky
            </span>
          </Link>

          <div className="min-w-0 flex-1">
            <GlobalSearchClient
              parks={parks}
              featuredParks={featuredParks}
              variant="nav"
            />
          </div>

          <nav className="hidden shrink-0 items-center gap-1 nav:flex">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Button href="/download" variant="primary" className="ml-2">
              Get the app
            </Button>
          </nav>

          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100 nav:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {!hideCategoryBar && (
          <div className="hidden border-t border-slate-100 nav:block">
            <CategoryBar resorts={resorts} topics={topics} />
          </div>
        )}
      </div>

      {open && (
        <MobileNavMenu
          resorts={resorts}
          topics={topics}
          primaryLinks={links}
          showCategories={!hideCategoryBar}
          onClose={closeMenu}
        />
      )}
    </header>
  );
}
