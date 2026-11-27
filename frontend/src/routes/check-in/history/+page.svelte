<script lang="ts">
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getDaysInMonth, getUrlFormat } from '$lib/helpers/DateHelper';
	import { fade } from 'svelte/transition';
	import CheckInCalendar from '$lib/components/check-in/overview/CheckInCalendar.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import { trackerLabel } from '$lib/helpers/CheckInHelper';
	import type { CheckInTracker } from '$lib/types/check_in';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import CheckInSummaries from '$lib/components/check-in/overview/CheckInSummaries.svelte';
	import Averages from '$lib/components/check-in/stats/Averages.svelte';
	import IconChevronLeft from '$lib/icons/lucide/chevron-left.svelte';
	import IconChevronRight from '$lib/icons/lucide/chevron-right.svelte';

	const checkInData = getCheckInData();
	const ts = getTranslation();
	const auth = getAuth();

	let selected = $state<string>('all');
	const shown = $derived(calendarTracker(selected));

	function calendarTracker(value: string): CheckInTracker | 'total' | 'all' {
		if (value === 'all' || value === 'total') return value;
		return checkInData.activeTrackers.find((t) => String(t.id) === value) ?? 'all';
	}

	function trackerOptions(): { label: string; value: string }[] {
		const options = [{ label: ts.get.checkIn.all_entries, value: 'all' }];
		if (checkInData.scoredTrackers.length > 0) options.push({ label: ts.get.checkIn.total, value: 'total' });
		options.push(...checkInData.activeTrackers.map((t) => ({ label: trackerLabel(t, ts.get.checkIn), value: String(t.id) })));
		return options;
	}

	const dates = $derived(getDaysInMonth(checkInData.historyMonth.year, checkInData.historyMonth.month).reverse());

	const monthDates = $derived(dates.map((d) => getUrlFormat(d)));
	const builtInTrackers = $derived(checkInData.activeTrackers.flatMap((t) => (t.key === null ? [] : [t.key])));

	const monthLabel = $derived(
		new Date(checkInData.historyMonth.year, checkInData.historyMonth.month, 1)
			.toLocaleDateString(ts.locale, { month: 'long', year: 'numeric' })
	);
</script>

<div class="flex flex-col gap-4 2xl:gap-8">
	<div class="flex items-center justify-center gap-2 pt-2">
		<button
			type="button"
			class="cursor-pointer rounded-lg p-1 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
			onclick={() => checkInData.prevMonth()}
		>
			<IconChevronLeft class="size-5" />
		</button>
		<span class="w-56 text-center text-2xl font-semibold">{monthLabel}</span>
		<button
			type="button"
			class="cursor-pointer rounded-lg p-1 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
			class:invisible={checkInData.isCurrentMonth()}
			onclick={() => checkInData.nextMonth()}
		>
			<IconChevronRight class="size-5" />
		</button>
	</div>

	<div class="flex flex-col gap-6 2xl:flex-row 2xl:items-start 2xl:gap-0">
		<div class="flex flex-col gap-2 2xl:w-[70%] 2xl:pr-6">
			<div class="sm:w-64 sm:self-end">
				<Select value={selected} options={trackerOptions()} onchange={(value) => (selected = value)} ariaLabel={ts.get.checkIn.history} />
			</div>
			<CheckInCalendar tracker={shown} weekStart={auth.getWeekStart()} />
		</div>
		<div class="flex flex-col border-c-neutral-1 2xl:w-[30%] 2xl:border-l-2 2xl:pl-6 dark:border-s-dark">
			{#if checkInData.loaded}
				<div transition:fade={{ duration: 150 }}>
					<Averages dates={monthDates} />
					<CheckInSummaries {dates} trackers={builtInTrackers} />
				</div>
			{/if}
		</div>
	</div>
</div>
