<script lang="ts">
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getDaysInMonth, getUrlFormat } from '$lib/helpers/DateHelper';
	import { SvelteDate } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import type { CheckIn } from '$lib/types/check_in';
	import OverviewDesktop from '$lib/components/check-in/overview/OverviewDesktop.svelte';
	import OverviewMobile from '$lib/components/check-in/overview/OverviewMobile.svelte';
	import CheckInSummaries from '$lib/components/check-in/overview/CheckInSummaries.svelte';
	import Averages from '$lib/components/check-in/stats/Averages.svelte';
	import IconChevronLeft from '@lucide/svelte/icons/chevron-left';
	import IconChevronRight from '@lucide/svelte/icons/chevron-right';

	const viewPoint = getViewPoint();
	const checkInData = getCheckInData();
	const ts = getTranslation();

	const dates = $derived(getDaysInMonth(checkInData.historyMonth.year, checkInData.historyMonth.month).reverse());

	const monthData = $derived.by((): CheckIn[] => {
		const dateStrings = new Set(dates.map((d) => getUrlFormat(d)));
		return checkInData.data.filter((c) => dateStrings.has(c.date));
	});

	const monthLabel = $derived(
		new SvelteDate(checkInData.historyMonth.year, checkInData.historyMonth.month, 1)
			.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
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

	{#if viewPoint.isDesktop}
		<div class="hidden 2xl:flex 2xl:flex-row 2xl:items-start gap-0">
			<div class="w-3/4 2xl:w-[70%]">
				<OverviewDesktop {dates} trackers={checkInData.activeTrackers} />
			</div>
			<div class="w-1/4 2xl:w-[30%] flex flex-col 2xl:border-l-2 border-c-neutral-1 dark:border-s-dark 2xl:pl-6">
				{#if checkInData.loaded}
					<div transition:fade={{ duration: 150 }}>
						<Averages data={monthData} activeTrackers={checkInData.activeTrackers} scoredTrackers={checkInData.scoredTrackers} />
						<CheckInSummaries {dates} trackers={checkInData.activeTrackers} />
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="flex flex-col gap-6 2xl:hidden">
			<OverviewMobile {dates} trackers={checkInData.activeTrackers} />
			{#if checkInData.loaded}
				<div transition:fade={{ duration: 150 }}>
					<Averages data={monthData} activeTrackers={checkInData.activeTrackers} scoredTrackers={checkInData.scoredTrackers} />
					<CheckInSummaries {dates} trackers={checkInData.activeTrackers} />
				</div>
			{/if}
		</div>
	{/if}
</div>
