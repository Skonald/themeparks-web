import { GlobalSearchClient } from "@/components/GlobalSearchClient";
import type { Park } from "@/lib/api/types";

export function HomeSearchClient({
  parks,
  featuredParks,
}: {
  parks: Park[];
  featuredParks: Park[];
}) {
  return (
    <GlobalSearchClient
      parks={parks}
      featuredParks={featuredParks}
      variant="hero"
      className="mt-6 max-w-xl"
    />
  );
}
