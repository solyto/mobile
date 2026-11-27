import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import { setWeather, type Weather } from '$lib/state/Weather.svelte';
import type { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import ManageWeatherCity from '$lib/components/weather/ManageWeatherCity.svelte';
import { renderWithContext } from './helpers/context';
import { rejectionsDuring } from './helpers/rejections';
import StoreHarness from './helpers/StoreHarness.svelte';

const BERLIN = { place_id: 1, display_name: 'Berlin, Germany', lat: '52.52', lon: '13.40' };

let loadingIndicator: LoadingIndicator;
const fetch = vi.fn();

function renderModal(seed: (weather: Weather) => void = () => {}): { weather: Weather; onClose: () => void } {
	let store: Weather | null = null;
	const onClose = vi.fn();
	renderWithContext(StoreHarness, {
		component: ManageWeatherCity,
		provide: setWeather,
		props: { onClose },
		onReady: (weather: Weather) => {
			seed(weather);
			store = weather;
		}
	}, { onReady: (stores) => (loadingIndicator = stores.loadingIndicator as LoadingIndicator) });
	return { weather: store!, onClose };
}

async function search(query: string): Promise<void> {
	await fireEvent.input(screen.getByPlaceholderText('Search for a city...'), { target: { value: query } });
	await vi.advanceTimersByTimeAsync(300);
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.stubGlobal('fetch', fetch);
	fetch.mockResolvedValue({ ok: true, json: async () => [BERLIN] });
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	fetch.mockReset();
});

describe('Weather city search', () => {
	it('asks Nominatim for five English city names after a pause in typing', async () => {
		renderModal();

		await search('Ber lin');

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith(
			'https://nominatim.openstreetmap.org/search?q=Ber%20lin&format=json&addressdetails=1&limit=5&featuretype=city',
			{ headers: { 'Accept-Language': 'en' } }
		);
		expect(screen.getByText('Berlin, Germany')).toBeInTheDocument();
	});

	it('does not search for fewer than three letters', async () => {
		renderModal();

		await search('Be');

		expect(fetch).not.toHaveBeenCalled();
	});

	it('saves the chosen city and closes', async () => {
		const { weather, onClose } = renderModal((store) => {
			store.updateCity = vi.fn().mockResolvedValue(true);
		});

		await search('Berlin');
		await fireEvent.click(screen.getByText('Berlin, Germany'));

		expect(weather.updateCity).toHaveBeenCalledWith({ city: 'Berlin', latitude: 52.52, longitude: 13.4 });
		expect(onClose).toHaveBeenCalled();
	});

	it('stops the loading indicator even when saving throws', async () => {
		renderModal((store) => {
			store.updateCity = vi.fn().mockRejectedValue(new Error('offline'));
		});

		await search('Berlin');
		vi.useRealTimers();
		const rejections = await rejectionsDuring(() => fireEvent.click(screen.getByText('Berlin, Germany')).then(() => {}));

		expect(rejections).toEqual([new Error('offline')]);
		expect(loadingIndicator.active).toBe(false);
	});
});
