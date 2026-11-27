<script lang="ts">
	import { onMount } from 'svelte';
	import { formatDuration } from '$lib/helpers/TimeTrackingHelper';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import DateInput from '$lib/components/forms/DateInput.svelte';
	import TimeTrackingGroupingService from '$lib/services/TimeTrackingGroupingService';
	import { getReadableTextColor } from '$lib/helpers/ColorHelper';
	import { getDateMinusDays, getUrlFormat } from '$lib/helpers/DateHelper';
	import type { TimeTrackingCategory } from '$lib/types/time_tracking';
	import { hamburgerClearance } from '$lib/config/navigation';

	const DEFAULT_RANGE_DAYS = 30;
	const CHIP_IDLE = 'border-c-neutral-2 text-c-neutral-5 hover:border-c-primary dark:border-s-dark dark:text-c-neutral-4';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const groupingService = new TimeTrackingGroupingService();

	const today = new Date();

	let fromDate = $state<string>(getUrlFormat(getDateMinusDays(today, DEFAULT_RANGE_DAYS)));
	let toDate = $state<string>(getUrlFormat(today));
	let selectedCategoryIds = $state<number[]>([]);

	let filteredProjects = $derived(tt.statistics?.by_project ?? []);

	let projectDonutData = $derived(
		filteredProjects.map((p) => ({
			value: p.total_minutes,
			name: p.project_title,
			color: p.color
		}))
	);

	let categoryBreakdown = $derived(groupingService.groupByCategory(filteredProjects, tt.projects));

	let categoryChartLabels = $derived(categoryBreakdown.map((c) => c.title));

	onMount(loadStats);

	async function loadStats(): Promise<void> {
		loadingIndicator.start();
		try {
			await tt.loadStatistics(fromDate, toDate, selectedCategoryIds);
		} finally {
			loadingIndicator.stop();
		}
	}

	async function toggleCategory(id: number): Promise<void> {
		if (selectedCategoryIds.includes(id)) {
			selectedCategoryIds = selectedCategoryIds.filter((c) => c !== id);
		} else {
			selectedCategoryIds = [...selectedCategoryIds, id];
		}
		await loadStats();
	}

	async function showAllCategories(): Promise<void> {
		selectedCategoryIds = [];
		await loadStats();
	}

	function isSelected(category: TimeTrackingCategory): boolean {
		return selectedCategoryIds.includes(category.id);
	}

	function categoryColor(category: TimeTrackingCategory): string {
		return category.color ?? 'var(--color-c-primary)';
	}

	function chipStyle(category: TimeTrackingCategory): string {
		if (!isSelected(category)) return '';
		const color = categoryColor(category);
		return `background-color: ${color}; border-color: ${color}; color: ${getReadableTextColor(color)}`;
	}

	function totalMinutes(): number {
		return filteredProjects.reduce((sum, p) => sum + p.total_minutes, 0);
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-start">
		<div class={hamburgerClearance}>
			<Heading title={ts.get.timeTracking.statistics} my={0} />
		</div>
		<div class="flex flex-wrap items-end gap-4">
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
					{ts.get.timeTracking.from}
				</span>
				<DateInput bind:value={fromDate} />
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
					{ts.get.timeTracking.to}
				</span>
				<DateInput bind:value={toDate} />
			</label>
			<TextButton title={ts.get.layout.apply} onclick={loadStats} />
		</div>
	</div>

	{#if tt.categories.length > 0}
		<div class="flex flex-col gap-2">
			<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.timeTracking.filter_by_category}
			</span>
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					onclick={showAllCategories}
					class="rounded-full border px-3 py-1 text-xs font-medium transition-colors {selectedCategoryIds.length === 0 ? 'border-c-primary bg-c-primary text-white' : CHIP_IDLE}"
				>
					{ts.get.timeTracking.all_categories}
				</button>
				{#each tt.categories as category (category.id)}
					<button
						type="button"
						onclick={() => toggleCategory(category.id)}
						class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors {isSelected(category) ? 'border-transparent' : CHIP_IDLE}"
						style={chipStyle(category)}
					>
						<span class="h-2 w-2 shrink-0 rounded-full" style="background-color: {categoryColor(category)}"></span>
						{category.title}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if tt.statistics}
		<div class="flex flex-row items-center gap-2">
			<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.timeTracking.total_time}:
			</span>
			<span class="text-lg font-bold text-c-primary">
				{formatDuration(totalMinutes())}
			</span>
		</div>

		<div class="flex w-full flex-row gap-8 max-md:flex-col">
			{#if projectDonutData.length > 0}
				<div class="w-full md:w-1/2">
					<span class="text-lg font-medium">{ts.get.timeTracking.projects}</span>
					<DoughnutChart
						values={projectDonutData}
						centerFormatter={formatDuration}
						valueFormatter={formatDuration}
					/>
				</div>
			{/if}
			{#if categoryChartLabels.length > 0}
				<div class="w-full md:w-1/2">
					<span class="text-lg font-medium">{ts.get.timeTracking.categories}</span>
					<BarChart
						categories={categoryChartLabels}
						values={categoryBreakdown.map((c) => c.minutes)}
						valueFormatter={formatDuration}
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>
