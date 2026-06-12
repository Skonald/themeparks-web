import { getAllParks } from "@/lib/api/parks";
import { getFeaturedParks } from "@/lib/parkUtils";
import {
  resolveResortCategories,
  TOPIC_CATEGORIES,
} from "@/lib/navCategories";
import { TopNav } from "@/components/TopNav";

export async function NavShell() {
  const parks = await getAllParks();
  const featuredParks = getFeaturedParks(parks, 6);
  const resorts = resolveResortCategories(parks);

  return (
    <TopNav
      parks={parks}
      featuredParks={featuredParks}
      resorts={resorts}
      topics={TOPIC_CATEGORIES}
    />
  );
}
