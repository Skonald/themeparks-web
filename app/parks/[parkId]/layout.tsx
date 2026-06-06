import type { Metadata } from "next";
import { getParkById } from "@/lib/api/parks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ parkId: string }>;
}): Promise<Metadata> {
  const { parkId } = await params;
  const park = await getParkById(parkId);
  if (!park) {
    return { title: "Park not found — ThemeParks" };
  }

  const title = `${park.name} — ThemeParks`;
  const description = `Live wait times, crowd calendar, trends, and events for ${park.name}. Research your visit on the web; plan your day in the app.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ParkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
