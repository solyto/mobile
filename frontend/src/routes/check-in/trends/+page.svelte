<script lang="ts">
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TrendChart from '$lib/components/check-in/stats/TrendChart.svelte';
	import type { CheckInTracker } from '$lib/types/check_in';
	import { onMount } from 'svelte';
	import { getUrlFormat, parseUrlFormat } from '$lib/helpers/DateHelper';
	import { trackerLabel } from '$lib/helpers/CheckInHelper';
	import { getAuth } from '$lib/state/Auth.svelte';

	type Range = '30d' | '3m' | '6m' | 'all';
	type ChartPoint = { date: string; value: number };

	const RANGE_DAYS: Record<Exclude<Range, 'all'>, number> = { '30d': 30, '3m': 90, '6m': 180 };

	const checkInData = getCheckInData();
	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();
	const auth = getAuth();

	let selectedRange = $state<Range>('30d');

	async function selectRange(range: Range): Promise<void> {
		selectedRange = range;
		if (range !== 'all') return;

		loadingIndicator.start();
		await checkInData.loadValuesFrom(null);
		loadingIndicator.stop();
	}

	const ranges: { label: string; value: Range }[] = [
		{ label: ts.get.checkIn.range_30_days, value: '30d' },
		{ label: ts.get.checkIn.range_3_months, value: '3m' },
		{ label: ts.get.checkIn.range_6_months, value: '6m' },
		{ label: ts.get.checkIn.range_all, value: 'all' }
	];

	const trackers = $derived(checkInData.activeTrackers.filter((t) => t.type === 'scale' || t.type === 'count'));
	const weeklyTrackers = $derived(checkInData.activeTrackers.filter((t) => t.type === 'yes_no' || t.type === 'sport'));

	const dates = $derived.by((): string[] => {
		const all = [...checkInData.index.keys()].sort();
		if (selectedRange === 'all') return all;

		const cutoff = new Date();
		cutoff.setDate(cutoff.getDate() - RANGE_DAYS[selectedRange]);
		const cutoffStr = getUrlFormat(cutoff);

		return all.filter((date) => date >= cutoffStr);
	});

	function isCharted(tracker: CheckInTracker, value: number | null): boolean {
		return value !== null && (tracker.type === 'count' || value !== 0);
	}

	function getChartData(tracker: CheckInTracker): { categories: string[]; values: number[] } {
		const points = dates
			.map((date) => ({ date, value: checkInData.getValue(tracker, date) }))
			.filter((point): point is ChartPoint => isCharted(tracker, point.value));

		return {
			categories: points.map((point) => auth.getDateWithoutYearInUserPreferredFormat(point.date)),
			values: points.map((point) => point.value)
		};
	}

	function weeklyFrom(): Date {
		const from = new Date();
		if (selectedRange !== 'all') {
			from.setDate(from.getDate() - RANGE_DAYS[selectedRange]);
			return from;
		}

		from.setDate(from.getDate() - 7);
		const first = dates[0] === undefined ? null : parseUrlFormat(dates[0]);
		return first !== null && first < from ? first : from;
	}

	function getWeeklyData(tracker: CheckInTracker): { categories: string[]; values: number[] } {
		const weeks = checkInData.trackerService.weeklyDays(tracker, checkInData.index, weeklyFrom(), new Date(), auth.getWeekStart());
		if (weeks.every((week) => week.days === 0)) return { categories: [], values: [] };

		return {
			categories: weeks.map((week) => auth.getDateWithoutYearInUserPreferredFormat(week.start)),
			values: weeks.map((week) => week.days)
		};
	}

	onMount(async () => {
		loadingIndicator.start();
		await checkInData.load();
		loadingIndicator.stop();
	});
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center gap-2 rounded-lg p-2">
		{#each ranges as range (range.value)}
			<button
				type="button"
				class="cursor-pointer rounded-lg px-4 py-2 drop-shadow-sm transition-all"
				class:bg-c-bg-elevated={selectedRange !== range.value}
				class:bg-c-btn={selectedRange === range.value}
				class:text-white={selectedRange === range.value}
				onclick={() => selectRange(range.value)}
			>
				{range.label}
			</button>
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
		{#each trackers as tracker (tracker.id)}
			<TrendChart
				label={trackerLabel(tracker, ts.get.checkIn)}
				{tracker}
				min={tracker.type === 'scale' ? 1 : 0}
				max={tracker.type === 'scale' ? 5 : undefined}
				{...getChartData(tracker)}
			/>
		{/each}
		{#each weeklyTrackers as tracker (tracker.id)}
			<TrendChart label={trackerLabel(tracker, ts.get.checkIn)} {tracker} min={0} max={7} {...getWeeklyData(tracker)} />
		{/each}
	</div>
</div>
