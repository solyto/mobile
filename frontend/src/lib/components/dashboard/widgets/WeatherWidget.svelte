<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import { onMount, onDestroy } from 'svelte';
	import { Auth } from '$lib/state/Auth.svelte';
	import { getWeather } from '$lib/state/Weather.svelte';
	import { Translation } from '$lib/state/Translation.svelte';
	import WeatherCodeImage from '$lib/components/weather/WeatherCodeImage.svelte';
	import ManageWeatherCity from '$lib/components/weather/ManageWeatherCity.svelte';
	import IconMapPin from '@lucide/svelte/icons/map-pin';
	import IconPen from '@lucide/svelte/icons/pen';

	const weather = getWeather();

	let { ts, auth } = $props<{
		ts: Translation;
		auth: Auth;
	}>();

	let date = new SvelteDate();
	let time = new SvelteDate();
	let forecast = $derived(weather.forecast);
	let temperatureUnit = $derived(auth?.user?.settings?.temperature_unit);

	let greeting = $derived.by(() => {
		const hour = time.getHours();
		if (hour < 12) return ts.get.home.greeting_morning;
		if (hour < 18) return ts.get.home.greeting_afternoon;
		return ts.get.home.greeting_evening;
	});

	let manageWeatherModalOpen = $state<boolean>(false);
	let clockInterval: ReturnType<typeof setInterval>;

	onMount(() => {
		clockInterval = setInterval(() => {
			time.setTime(Date.now());
		}, 1000);

		weather.load();
	});

	onDestroy(() => {
		clearInterval(clockInterval);
	});

	async function toggleTemperatureUnit(unit: 'c' | 'f'): Promise<void> {
		if (unit === temperatureUnit) return;
		auth.user.settings.temperature_unit = unit;
		await weather.updateTemperatureUnit(unit);
	}

	function toggleWeatherModal(): void {
		manageWeatherModalOpen = !manageWeatherModalOpen;
	}
</script>

<div class="flex flex-col gap-12">
	<div class="group relative">
		<button
			class="absolute top-[-14px] right-[-14px] z-10 cursor-pointer rounded-full border-1 border-d-lightblue bg-c-bg-surface p-2 text-c-neutral-3 opacity-0 shadow-xs transition-opacity group-hover:opacity-100 hover:text-c-neutral-5 dark:border-s-dark-2"
			onclick={toggleWeatherModal}
		>
			<IconPen size="18" />
		</button>
		<div class="flex flex-col">
			<div class="mb-2 ml-1 text-sm text-c-neutral-5 dark:text-c-neutral-4">
				{greeting}, {auth.user?.name?.split(' ')[0]}
			</div>
			<div
				class="text-5xl tracking-wide text-c-heading transition-all duration-300 ease-in-out dark:text-c-primary"
			>
				{auth.getTimeInUserPreferredFormat(time)}
			</div>
			<div class="mt-2 ml-1 text-lg text-c-heading dark:text-c-primary">
				{auth.getDateWithWeekdayInUserPreferredFormat(date)}
			</div>
			{#if weather.loaded && weather.configured && forecast}
				<div class="mt-4 ml-1 flex items-center gap-3">
					<div class="flex items-center gap-2">
						<IconMapPin class="size-3 text-c-neutral-4 dark:text-c-neutral-5" />
						<span class="text-xs text-c-neutral-5 dark:text-c-neutral-4">{weather.city}</span>
					</div>
					<div class="h-3 w-px bg-c-neutral-2 dark:bg-s-dark-3"></div>
					<div class="flex items-center gap-2.5">
						<div class="flex h-8 w-8 items-center justify-center">
							<WeatherCodeImage code={forecast.today.code} />
						</div>
						<span class="text-lg font-semibold text-c-neutral-8 dark:text-white">
							{auth.getTemperatureInUserPreferredFormat(forecast.current.temperature)}°
						</span>
						<span class="whitespace-nowrap text-xs text-c-neutral-4 dark:text-c-neutral-5">
							{auth.getTemperatureInUserPreferredFormat(forecast.today.temperature_min)}° / {auth.getTemperatureInUserPreferredFormat(forecast.today.temperature_max)}°
						</span>
					</div>
					<button
						class="ml-auto shrink-0 cursor-pointer rounded-md bg-c-neutral-1 px-2 py-1 text-xs font-medium text-c-neutral-5 transition-colors hover:bg-c-neutral-2 hover:text-c-neutral-7 dark:bg-s-dark-3 dark:text-c-neutral-4 dark:hover:bg-s-dark-2 dark:hover:text-c-neutral-2"
						onclick={() => toggleTemperatureUnit(temperatureUnit === 'c' ? 'f' : 'c')}
					>{temperatureUnit.toUpperCase()}°</button>
				</div>
			{:else if weather.loaded}
				<button
					class="mt-4 ml-1 flex w-fit cursor-pointer items-center gap-1 text-xs text-c-primary transition-colors hover:text-c-primary/80"
					onclick={toggleWeatherModal}
				>
					<IconMapPin class="size-3" />
					<span>{ts.get.widgets.select_city_prompt}</span>
				</button>
			{/if}
		</div>
	</div>
</div>
{#if manageWeatherModalOpen}
	<ManageWeatherCity onClose={toggleWeatherModal} />
{/if}
