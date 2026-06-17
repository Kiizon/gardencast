export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // state/province
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  windspeed_10m: number[];
  weathercode: number[];
  uv_index: number[];
}

export interface DailyWeather {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  windspeed_10m_max: number[];
  weathercode: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
}

export interface WeatherData {
  hourly: HourlyWeather;
  daily: DailyWeather;
  latitude: number;
  longitude: number;
  timezone: string;
}

export type RecommendationLevel = 'all_good' | 'attention_needed' | 'action_required';

export interface GardenTask {
  icon: string;
  title: string;
  context: string;
}

export interface Recommendation {
  level: RecommendationLevel;
  headline: string;
  reason: string;
  tips?: string[];
  tasks: GardenTask[];
}


