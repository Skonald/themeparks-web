export function buildPlanDeepLink(parkId?: string, date?: string): string {
  const params = new URLSearchParams();
  if (parkId) params.set("park", parkId);
  if (date) params.set("date", date);
  const query = params.toString();
  return query ? `themeparky://plan?${query}` : "themeparky://plan";
}
