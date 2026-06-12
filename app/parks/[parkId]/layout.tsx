import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ParkPageHeader } from "@/components/ParkPageHeader";
import { ParkPills } from "@/components/ParkPills";
import { ParkStatusBar } from "@/components/ParkStatusBar";
import { ParkSubNavFromPath } from "@/components/ParkSubNavFromPath";
import { getAllParks, getParkById, getParkOperatingHours } from "@/lib/api/parks";
import { getResortParks } from "@/lib/parkUtils";

export const revalidate = 300;

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

export default async function ParkLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ parkId: string }>;
}) {
  const { parkId } = await params;
  const park = await getParkById(parkId);
  if (!park) notFound();

  const [hours, allParks] = await Promise.all([
    getParkOperatingHours(parkId),
    getAllParks(),
  ]);
  const resort = getResortParks(parkId, allParks);

  return (
    <div className="space-y-5">
      <ParkPageHeader park={park} />
      {resort && (
        <ParkPills
          groupName={resort.groupName}
          parks={resort.parks}
          activeParkId={parkId}
        />
      )}
      <ParkStatusBar hours={hours} />
      <ParkSubNavFromPath parkId={parkId} />
      <div className="space-y-8">{children}</div>
    </div>
  );
}
