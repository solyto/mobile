<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getWeather } from '$lib/state/Weather.svelte';
	import type { NominatimResult, UpdateWeatherCityRequest } from '$lib/types/weather';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import IconMapPin from '$lib/icons/lucide/map-pin.svelte';
	import IconSearch from '$lib/icons/lucide/search.svelte';

	const MIN_QUERY_LENGTH = 3;
	const SEARCH_DELAY_MS = 300;
	const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const weather = getWeather();

	let { onClose }: { onClose: () => void } = $props();

	let searchQuery = $state<string>('');
	let searchResults = $state<NominatimResult[]>([]);
	let searching = $state<boolean>(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	function hasSearchableQuery(): boolean {
		return searchQuery.length >= MIN_QUERY_LENGTH;
	}

	function searchUrl(query: string): string {
		return `${NOMINATIM_SEARCH_URL}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&featuretype=city`;
	}

	async function searchCities(): Promise<void> {
		if (!hasSearchableQuery()) {
			searchResults = [];
			return;
		}

		searching = true;
		const res = await fetch(searchUrl(searchQuery), { headers: { 'Accept-Language': 'en' } });

		if (res.ok) {
			searchResults = await res.json();
		}
		searching = false;
	}

	function onSearchInput(): void {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(searchCities, SEARCH_DELAY_MS);
	}

	async function selectCity(result: NominatimResult): Promise<void> {
		const request: UpdateWeatherCityRequest = {
			city: result.display_name.split(',')[0],
			latitude: parseFloat(result.lat),
			longitude: parseFloat(result.lon)
		};

		loadingIndicator.start();
		try {
			await weather.updateCity(request);
		} finally {
			loadingIndicator.stop();
		}
		onClose();
	}
</script>

<ContentModal title={ts.get.widgets.select_city} rounded="2xl" p="4" showTitleOnMobile={true} {onClose}>
	<div class="flex w-full min-w-80 flex-col gap-4">
		<div class="relative">
			<TextInput bind:value={searchQuery} placeholder={ts.get.widgets.search_city} oninput={onSearchInput} />
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
		{:else if hasSearchableQuery()}
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
