export interface ParkLocation {
  city?: string;
  state?: string;
  country?: string;
}

export interface Park {
  park_id: string;
  name: string;
  location?: string | ParkLocation;
  timezone?: string;
  operator?: string;
  latitude?: number;
  longitude?: number;
}

export interface ParksListResponse {
  parks?: Park[];
  total?: number;
  page?: number;
}

export interface AttractionWait {
  attraction_id: string;
  attraction_name: string;
  wait_time_minutes?: number | null;
  status?: string;
  access_features?: Array<{
    type?: string;
    availability?: { available?: boolean; return_time?: string };
  }>;
}

export interface ParkWaitTimesResponse {
  park_id: string;
  park_name?: string;
  attractions: AttractionWait[];
  updated_at?: string;
}

export interface CrowdForecast {
  forecast_id?: string;
  park_id: string;
  date: string;
  crowd_level: string;
  forecast_accuracy?: number;
}

export interface ForecastRangeResponse {
  park_id: string;
  forecasts: CrowdForecast[];
}

export interface ParkEvent {
  event_id?: string;
  name: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
}

export interface ParkHourlyWait {
  hour: number;
  p50_wait_minutes: number;
  attraction_count?: number;
}

export interface AttractionHourlyPoint {
  hour: number;
  p50_wait_minutes: number;
  p90_wait_minutes?: number;
}

export interface AttractionHourlyWaits {
  attraction_id: string;
  attraction_name: string;
  hourly: AttractionHourlyPoint[];
}

export interface WaitAggregatesResponse {
  park_id: string;
  day_of_week: number;
  park_hourly: ParkHourlyWait[];
  attractions: AttractionHourlyWaits[];
  meta?: Record<string, unknown>;
}

export interface OperatingHoursEntry {
  date: string;
  opening_time?: string;
  closing_time?: string;
  hour_type?: string;
}

export interface ParkOperatingHours {
  park_name?: string;
  operating_hours?: OperatingHoursEntry[];
}
