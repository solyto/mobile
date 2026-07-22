import type { Forecast, UpdateWeatherCityRequest, UpdateWeatherTemperatureUnitRequest, WeatherResponse } from '$lib/types/weather';
import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class Weather {
	loaded = $state<boolean>(false);
	configured = $state<boolean>(false);
	city = $state<string | null>(null);
	forecast = $state<Forecast | null>(null);
	auth = getAuth();
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load(): Promise<void> {
		const res = await this.apiService.get(apiRoutes.weather.today, null);
		if (res) {
			const data = res.data as WeatherResponse;
			this.configured = data.configured;
			this.city = data.city;
			if (data.configured && data.today && data.current) {
				this.forecast = {
					city: data.city,
					configured: data.configured,
					today: data.today,
					current: data.current
				};
			}
			this.loaded = true;
		}
	}

	async updateCity(request: UpdateWeatherCityRequest): Promise<boolean> {
		const success = await this.apiService.put(apiRoutes.users.settings.updateWeatherCity, request);
		if (success) {
			await this.load();
		}
		return success;
	}

	async updateTemperatureUnit(unit: 'c' | 'f'): Promise<boolean> {
		const request: UpdateWeatherTemperatureUnitRequest = { temperature_unit: unit };
		const success = await this.apiService.put(apiRoutes.users.settings.updateWeatherTemperatureUnit, request);
		if (success) {
			await this.load();
		}
		return success;
	}
}

const WEATHER_KEY = Symbol('SOLYTO_WEATHER');

export function setWeather(): Weather {
	return setContext(WEATHER_KEY, new Weather());
}

export function getWeather(): Weather {
	return getContext<Weather>(WEATHER_KEY);
}
