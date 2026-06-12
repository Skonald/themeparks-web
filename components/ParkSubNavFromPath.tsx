"use client";

import { usePathname } from "next/navigation";
import {
  PARK_TABS,
  ParkSubNav,
  type ParkTabSlug,
} from "@/components/ParkSubNav";

function activeTabFromPath(pathname: string, parkId: string): ParkTabSlug {
  const prefix = `/parks/${parkId}/`;
  if (!pathname.startsWith(prefix)) return "trends";
  const slug = pathname.slice(prefix.length).split("/")[0];
  if (PARK_TABS.some((tab) => tab.slug === slug)) {
    return slug as ParkTabSlug;
  }
  return "trends";
}

export function ParkSubNavFromPath({ parkId }: { parkId: string }) {
  const pathname = usePathname();
  const active = activeTabFromPath(pathname, parkId);
  return <ParkSubNav parkId={parkId} active={active} />;
}

export function activeParkTabFromPath(
  pathname: string,
  parkId: string,
): ParkTabSlug {
  return activeTabFromPath(pathname, parkId);
}
