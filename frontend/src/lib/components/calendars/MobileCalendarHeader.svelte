<script lang="ts">
	import IconChevronLeft from '@lucide/svelte/icons/chevron-left';
	import IconChevronRight from '@lucide/svelte/icons/chevron-right';
	import IconPlus from '@lucide/svelte/icons/plus';
	import IconChevronDown from '@lucide/svelte/icons/chevron-down';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconMonth from '$lib/components/ui/icons/IconMonth.svelte';
	import IconWeek from '$lib/components/ui/icons/IconWeek.svelte';
	import IconDay from '$lib/components/ui/icons/IconDay.svelte';
	import IconList from '$lib/components/ui/icons/IconList.svelte';
	import NavigationEntry from '$lib/components/calendars/NavigationEntry.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { formatDateWithoutYear } from '$lib/helpers/DateHelper';

	const calendars = getCalendars();
	const ts = getTranslation();

	let calendarsExpanded = $state<boolean>(false);

	function getNavigationLabel(): string {
		if (calendars.view === 'month') {
			return (
				ts.get.calendar.months[
					calendars.currentMonth as keyof typeof ts.get.calendar.months
				] +
				' ' +
				calendars.currentYear
			);
		}
		if (calendars.view === 'week') {
			return ts.get.calendar.calendar_week + ' ' + calendars.currentWeek;
		}
		if (calendars.view === 'day') {
			return formatDateWithoutYear(calendars.currentDate);
		}
		return formatDateWithoutYear(calendars.currentDate);
	}

	async function navigateBack(): Promise<void> {
		if (calendars.view === 'month') await calendars.lastMonth();
		else if (calendars.view === 'week') calendars.lastWeek();
		else calendars.lastDay();
	}

	async function navigateForward(): Promise<void> {
		if (calendars.view === 'month') await calendars.nextMonth();
		else if (calendars.view === 'week') calendars.nextWeek();
		else calendars.nextDay();
	}
</script>

<div
	class="flex w-full flex-col gap-2 border-b border-c-neutral-1 bg-white px-3 py-2 lg:hidden dark:border-s-dark dark:bg-s-dark-2"
>
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-1">
			<button
				class="cursor-pointer rounded-lg p-2 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
				class:bg-c-neutral-1={calendars.view === 'month'}
				class:dark:bg-s-dark-3={calendars.view === 'month'}
				onclick={() => calendars.changeView('month')}
				title={ts.get.calendar.month}
			>
				<IconMonth selected={calendars.view === 'month'} />
			</button>
			<button
				class="cursor-pointer rounded-lg p-2 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
				class:bg-c-neutral-1={calendars.view === 'week'}
				class:dark:bg-s-dark-3={calendars.view === 'week'}
				onclick={() => calendars.changeView('week')}
				title={ts.get.calendar.week}
			>
				<IconWeek selected={calendars.view === 'week'} />
			</button>
			<button
				class="cursor-pointer rounded-lg p-2 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
				class:bg-c-neutral-1={calendars.view === 'day'}
				class:dark:bg-s-dark-3={calendars.view === 'day'}
				onclick={() => calendars.changeView('day')}
				title={ts.get.calendar.day}
			>
				<IconDay selected={calendars.view === 'day'} />
			</button>
			<button
				class="cursor-pointer rounded-lg p-2 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
				class:bg-c-neutral-1={calendars.view === 'list'}
				class:dark:bg-s-dark-3={calendars.view === 'list'}
				onclick={() => calendars.changeView('list')}
				title={ts.get.calendar.list}
			>
				<IconList selected={calendars.view === 'list'} />
			</button>
		</div>
		<div class="flex items-center gap-1">
			<TextButton
				title={ts.get.calendar.today}
				onclick={async () => await calendars.goToToday()}
				type="slight"
			/>
			<button
				class="cursor-pointer rounded-lg p-2 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
				onclick={async () => await calendars.showSidebar(calendars.mobileSelectedDate)}
			>
				<IconPlus class="size-5" />
			</button>
			<button
				class="cursor-pointer rounded-lg p-1 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
				onclick={() => {
					calendarsExpanded = !calendarsExpanded;
				}}
			>
				<IconChevronDown
					class="size-4 transition-transform {calendarsExpanded ? 'rotate-180' : ''}"
				/>
			</button>
		</div>
	</div>
	{#if calendars.view !== 'list'}
		<div class="flex items-center justify-center gap-4">
			<button
				class="cursor-pointer rounded-lg p-1 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
				onclick={navigateBack}
			>
				<IconChevronLeft class="size-5" />
			</button>
			<span class="min-w-32 text-center text-sm font-bold">{getNavigationLabel()}</span>
			<button
				class="cursor-pointer rounded-lg p-1 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
				onclick={navigateForward}
			>
				<IconChevronRight class="size-5" />
			</button>
		</div>
	{/if}
	{#if calendarsExpanded}
		<div class="flex flex-wrap gap-2 px-2 pb-1">
			{#each calendars.calendars as calendar (calendar.id)}
				<NavigationEntry {calendar} />
			{/each}
		</div>
	{/if}
</div>
