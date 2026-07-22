<script lang="ts">
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
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import ImportButton from '$lib/components/ui/buttons/ImportButton.svelte';
	import CloudButton from '$lib/components/ui/buttons/CloudButton.svelte';
	import { page } from '$app/state';

	let editMode = $state<boolean>(page.url.searchParams.has('invitations'));

	const calendars = getCalendars();
	const ts = getTranslation();

	const activeCalendars = $derived([
		...calendars.ownedCalendars,
		...calendars.acceptedSharedCalendars
	]);
</script>

<div
	class="absolute z-40 hidden h-full max-h-screen w-16 flex-col overflow-y-auto bg-c-bg-surface drop-shadow-xl transition-all lg:relative lg:flex"
	class:lg:w-60={editMode}
	class:lg:w-80={editMode}
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
					<button
						class="cursor-pointer border-r-2 p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
						class:border-c-border={calendars.view !== 'month'}
						class:border-c-btn={calendars.view === 'month'}
						onclick={() => {
							calendars.changeView('month');
						}}
						title={ts.get.calendar.month}
					>
						<IconMonth selected={calendars.view === 'month'} />
					</button>
					<button
						class="cursor-pointer border-r-2 p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
						class:border-c-border={calendars.view !== 'week'}
						class:border-c-btn={calendars.view === 'week'}
						onclick={() => {
							calendars.changeView('week');
						}}
						title={ts.get.calendar.week}
					>
						<IconWeek selected={calendars.view === 'week'} />
					</button>
					<button
						class="cursor-pointer border-r-2 p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
						class:border-c-border={calendars.view !== 'day'}
						class:border-c-btn={calendars.view === 'day'}
						onclick={() => {
							calendars.changeView('day');
						}}
						title={ts.get.calendar.day}
					>
						<IconDay selected={calendars.view === 'day'} />
					</button>
					<button
						class="cursor-pointer border-r-2 p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
						class:border-c-border={calendars.view !== 'list'}
						class:border-c-btn={calendars.view === 'list'}
						onclick={() => {
							calendars.changeView('list');
						}}
						title={ts.get.calendar.list}
					>
						<IconList selected={calendars.view === 'list'} />
					</button>
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
				<EditButton
					inModal={false}
					onClick={() => {
						editMode = true;
					}}
					title={ts.get.calendar.manage_calendars}
				/>
				<ImportButton
					onClick={() => {
						calendars.importModal = true;
					}}
					title={ts.get.calendar.import_calendars}
				/>
				<CloudButton
					onClick={() => {
						calendars.syncModal = true;
					}}
					title={ts.get.calendar.synchronize}
				/>
			</div>
		</div>
	{/if}
	{#if editMode}
		<div in:blur>
			<ManageCalendars
				onClose={() => {
					editMode = false;
				}}
			/>
		</div>
	{/if}
</div>
