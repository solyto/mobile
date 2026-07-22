<script lang="ts">
	import type { Calendar } from '$lib/types/calendar';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { calendar = $bindable(), availableCalendars } = $props<{
		calendar: number;
		availableCalendars: Calendar[];
		preSelect?: Calendar;
	}>();

	const ts = getTranslation();

	let menuOpen = $state<boolean>(false);
	let selectedCalendar = $derived(getSelected(calendar) ?? availableCalendars[0]);

	$effect(() => {
		calendar = selectedCalendar.id;
	});

	function getSelected(id: number): Calendar | null {
		if (!id) return null;

		return availableCalendars.find((c: Calendar) => c.id === id) || null;
	}
</script>

<div
	role="button"
	tabindex="0"
	class="relative flex h-10 w-full cursor-pointer items-center justify-start rounded-lg border-1 border-c-neutral-2 px-3 text-sm text-c-neutral-5 shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-2 dark:bg-s-dark-3 dark:focus:ring-c-primary"
	onclick={() => {
		menuOpen = !menuOpen;
	}}
>
	{#if selectedCalendar}
		<div
			class="border-l-4 pl-4 dark:text-white"
			style="border-color: {selectedCalendar.color};"
		>
			{selectedCalendar.name}
		</div>
	{:else}
		{ts.get.calendar.choose_calendar}
	{/if}
	{#if menuOpen}
		<div
			class="absolute top-10 right-0 z-40 flex max-h-40 w-full flex-col gap-1 overflow-y-auto rounded-lg bg-white p-3 shadow-lg dark:bg-s-dark-3"
		>
			{#each availableCalendars as c (c.id)}
				<button
					class="cursor-pointer border-l-4 py-1 pl-4 text-left hover:bg-c-neutral"
					style="border-color: {c.color};"
					onclick={() => {
						calendar = c.id;
					}}
				>
					{c.name}
				</button>
			{/each}
		</div>
	{/if}
</div>
