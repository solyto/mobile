<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getWeather } from '$lib/state/Weather.svelte';
	import type { NominatimResult, UpdateWeatherCityRequest } from '$lib/types/weather.js';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import IconMapPin from '@lucide/svelte/icons/map-pin';
	import IconSearch from '@lucide/svelte/icons/search';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const weather = getWeather();

	let { onClose } = $props<{ onClose: () => void }>();

	let searchQuery = $state<string>('');
	let searchResults = $state<NominatimResult[]>([]);
	let searching = $state<boolean>(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	async function searchCities(): Promise<void> {
		if (searchQuery.length < 3) {
			searchResults = [];
			return;
		}

		searching = true;
		const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5&featuretype=city`;

		const res = await fetch(url, {
			headers: {
				'Accept-Language': 'en'
			}
		});

		if (res.ok) {
			searchResults = await res.json();
		}
		searching = false;
	}

	function onSearchInput(): void {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			searchCities();
		}, 300);
	}

	async function selectCity(result: NominatimResult): Promise<void> {
		loadingIndicator.start();

		const request: UpdateWeatherCityRequest = {
			city: result.display_name.split(',')[0],
			latitude: parseFloat(result.lat),
			longitude: parseFloat(result.lon)
		};

		await weather.updateCity(request);
		loadingIndicator.stop();
		onClose();
	}
</script>

<ContentModal title={ts.get.widgets.select_city} rounded="2xl" p="4" {onClose}>
	<div class="flex w-full min-w-80 flex-col gap-4">
		<div class="relative">
			<TextInput
				bind:value={searchQuery}
				placeholder={ts.get.widgets.search_city}
				oninput={onSearchInput}
			/>
			<IconSearch class="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-c-neutral-4" />
		</div>

		{#if searching}
			<div class="py-4 text-center text-c-neutral-5">
				{ts.get.widgets.loading}...
			</div>
		{:else if searchResults.length > 0}
			<div class="flex max-h-80 flex-col gap-2 overflow-y-auto">
				{#each searchResults as result (result.place_id)}
					<button
						class="flex cursor-pointer items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
						onclick={() => selectCity(result)}
					>
						<IconMapPin class="size-5 shrink-0 text-c-primary" />
						<span class="text-sm">{result.display_name}</span>
					</button>
				{/each}
			</div>
		{:else if searchQuery.length >= 3}
			<div class="py-4 text-center text-c-neutral-5">
				{ts.get.widgets.no_cities_found}
			</div>
		{:else}
			<div class="py-4 text-center text-sm text-c-neutral-4">
				{ts.get.widgets.search_city_hint}
			</div>
		{/if}
	</div>
</ContentModal>
