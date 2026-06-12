import { redirect } from "next/navigation";

export default async function ParkPage({
  params,
}: {
  params: Promise<{ parkId: string }>;
}) {
  const { parkId } = await params;
  redirect(`/parks/${parkId}/trends`);
}
