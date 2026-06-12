export interface ParkLocation {
  city?: string;
  state?: string;
  country?: string;
}

export interface Park {
  park_id: string;
  slug?: string;
  name: string;
  location?: string | ParkLocation;
  timezone?: string;
  operator?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
}

export interface ParksPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ParksListResponse {
  parks?: Park[];
  pagination?: ParksPagination;
  total?: number;
  page?: number;
  message?: string;
}

export interface AccessFeature {
  feature_id?: string;
  type?: string;
  status?: string;
  is_paid?: boolean;
  price_amount?: number | null;
  currency?: string;
  availability?: {
    available?: boolean;
    return_time?: string;
    price?: string;
    price_amount?: number | null;
    booking_status?: string;
  };
}

export interface AttractionWait {
  attraction_id: string;
  attraction_name: string;
  wait_time_minutes?: number | null;
  status?: string;
  access_features?: AccessFeature[];
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
  park_id?: string;
  name: string;
  event_type?: string;
  description?: string;
  /** ISO timestamp from Wiki schedule ingest (primary). */
  start_time?: string;
  end_time?: string;
  /** Legacy date-only fields (ParkEvents / forecasts). */
  start_date?: string;
  end_date?: string;
  wiki_schedule_type?: string;
  source?: string;
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

export interface LLSelloutHourlyPoint {
  hour: number;
  sold_out_rate: number;
  sample_count?: number;
}

export interface LLSelloutAttractionRow {
  attraction_id: string;
  attraction_name: string;
  sell_out_hour_p50?: number | null;
  hourly: LLSelloutHourlyPoint[];
}

export interface LLSelloutAggregatesResponse {
  park_id: string;
  day_of_week: number;
  booking_type?: string;
  attractions: LLSelloutAttractionRow[];
  meta?: Record<string, unknown>;
}

export interface CharacterHourlyPoint {
  hour: number;
  active: boolean;
}

export interface CharacterHourlyRow {
  character_id: string;
  character_name: string;
  location?: string;
  hourly: CharacterHourlyPoint[];
}

export interface CharacterHourlyGridResponse {
  park_id: string;
  date: string;
  characters: CharacterHourlyRow[];
  meta?: Record<string, unknown>;
}

export interface CharacterWaitHourlyPoint {
  hour: number;
  p50_wait_minutes: number;
  p90_wait_minutes?: number | null;
}

export interface CharacterWaitRow {
  character_id: string;
  character_name: string;
  location?: string;
  hourly: CharacterWaitHourlyPoint[];
}

export interface CharacterWaitAggregatesResponse {
  park_id: string;
  day_of_week: number;
  characters: CharacterWaitRow[];
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

export interface CharacterMeetSchedule {
  schedule_id?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  notes?: string;
  updated_at?: string;
}

export interface CharacterMeet {
  meet_greet_id: string;
  park_id: string;
  character_name: string;
  location?: string;
  character_type?: string;
  is_special_event?: boolean;
  requires_reservation?: boolean;
  updated_at?: string;
  schedules: CharacterMeetSchedule[];
}

export interface CharacterMeetsResponse {
  data?: CharacterMeet[];
  total_records?: number;
}
