export interface CurrentWeather {
	code: number;
	temperature: number;
	humidity: number;
	wind: number;
	wind_direction: number;
	clouds: number;
	rain: number;
	snowfall: number;
}

export interface WeatherToday {
	code: number;
	temperature_min: number;
	temperature_max: number;
	humidity: number;
	wind: number;
	clouds: number;
	rain: number;
	snowfall: number;
	sunrise: string;
	sunset: string;
	uv_index: number;
}

export interface Forecast {
	city: string | null;
	configured: boolean;
	today: WeatherToday;
	current: CurrentWeather;
}

export interface WeatherResponse {
	city: string | null;
	configured: boolean;
	today?: WeatherToday;
	current?: CurrentWeather;
}

export interface UpdateWeatherCityRequest {
	city: string;
	latitude: number;
	longitude: number;
}

export interface UpdateWeatherTemperatureUnitRequest {
	temperature_unit: 'c' | 'f';
}

export interface NominatimResult {
	place_id: number;
	display_name: string;
	lat: string;
	lon: string;
}
