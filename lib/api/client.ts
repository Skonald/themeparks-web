const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(
  endpoint: string,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    }
  }
  const qs = params.toString();
  const url = `${BASE_URL}${endpoint}${qs ? `?${qs}` : ""}`;

  let res: Response;
  try {
    res = await fetch(url, {
      next: { revalidate: 300 },
    });
  } catch {
    throw new ApiError("Network error: API unreachable", 0);
  }

  if (!res.ok) {
    throw new ApiError(`HTTP ${res.status}: ${await res.text()}`, res.status);
  }

  return res.json() as Promise<T>;
}

export function getApiBaseUrl(): string {
  return BASE_URL;
}
