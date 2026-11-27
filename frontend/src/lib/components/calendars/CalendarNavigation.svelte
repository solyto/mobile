<script lang="ts">
	import NavIndicator from '$lib/components/ui/NavIndicator.svelte';
	import { blur, fade } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Divider from '$lib/components/ui/Divider.svelte';
	import ManageCalendars from '$lib/components/calendars/ManageCalendars.svelte';
	import NavigationEntry from '$lib/components/calendars/NavigationEntry.svelte';
	import EditButton from '$lib/components/ui/buttons/EditButton.svelte';
	import IconMonth from '$lib/components/ui/icons/IconMonth.svelte';
	import IconWeek from '$lib/components/ui/icons/IconWeek.svelte';
	import IconDay from '$lib/components/ui/icons/IconDay.svelte';
	import MonthNavigation from '$lib/components/calendars/views/month/MonthNavigation.svelte';
	import WeekNavigation from '$lib/components/calendars/views/week/WeekNavigation.svelte';
	import DayNavigation from '$lib/components/calendars/views/day/DayNavigation.svelte';
	import ListNavigation from '$lib/components/calendars/views/day/ListNavigation.svelte';
	import IconList from '$lib/components/ui/icons/IconList.svelte';
	import { getCalendars, type Calendars } from '$lib/state/Calendars.svelte';
	import { getCalendarImport } from '$lib/state/CalendarImport.svelte';
	import ImportButton from '$lib/components/ui/buttons/ImportButton.svelte';
	import CloudButton from '$lib/components/ui/buttons/CloudButton.svelte';
	import { page } from '$app/state';
	import type { Component } from 'svelte';

	let editMode = $state<boolean>(page.url.searchParams.has('invitations'));

	const calendars = getCalendars();
	const calendarImport = getCalendarImport();
	const ts = getTranslation();

	const activeCalendars = $derived([
		...calendars.ownedCalendars,
		...calendars.acceptedSharedCalendars
	]);

	const viewButtons: { view: (typeof Calendars.VIEWS)[number]; icon: Component<{ selected: boolean }> }[] = [
		{ view: 'month', icon: IconMonth },
		{ view: 'week', icon: IconWeek },
		{ view: 'day', icon: IconDay },
		{ view: 'list', icon: IconList }
	];

	function openEditMode(): void {
		editMode = true;
	}

	function closeEditMode(): void {
		editMode = false;
	}

	function openImport(): void {
		calendarImport.open();
	}

	function openSync(): void {
		calendars.syncModal = true;
	}
</script>

<div
	class="absolute z-40 hidden h-full max-h-screen w-16 flex-col overflow-y-auto bg-c-bg drop-shadow-xl transition-all lg:relative lg:flex dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
	class:lg:w-96={editMode}
	in:fade
>
	{#if !editMode}
		<div class="flex w-full flex-col" in:blur>
			<div class="text-md mb-4 flex w-full flex-col items-center justify-between font-bold">
				<div class="flex w-full flex-col items-center justify-center p-2 2xl:p-4">
					{#if calendars.view === 'month'}
						<MonthNavigation />
					{:else if calendars.view === 'week'}
						<WeekNavigation />
					{:else if calendars.view === 'day'}
						<DayNavigation />
					{:else if calendars.view === 'list'}
						<ListNavigation />
					{/if}
				</div>
				<Divider />
				<div class="flex w-full flex-col items-center justify-center">
					{#each viewButtons as button (button.view)}
						<button
							class="relative flex w-full cursor-pointer justify-center p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
							onclick={() => calendars.changeView(button.view)}
							title={ts.get.calendar[button.view]}
						>
							<button.icon selected={calendars.view === button.view} />
							<NavIndicator active={calendars.view === button.view} />
						</button>
					{/each}
				</div>
			</div>
			<Divider />
			<div class="flex w-full flex-col justify-center px-2 2xl:px-4">
				{#each activeCalendars as calendar (calendar.id)}
					<NavigationEntry {calendar} />
				{/each}
			</div>
			<Divider />
			<div class="flex aspect-square w-full flex-col items-center justify-center gap-4">
				<EditButton inModal={false} onClick={openEditMode} title={ts.get.calendar.manage_calendars} />
				<ImportButton onClick={openImport} title={ts.get.calendar.import_calendars} />
				<CloudButton onClick={openSync} title={ts.get.calendar.synchronize} />
			</div>
		</div>
	{/if}
	{#if editMode}
		<div in:blur>
			<ManageCalendars onClose={closeEditMode} />
		</div>
	{/if}
</div>
