<script lang="ts">
	import { onMount } from 'svelte';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	const today = new Date();
	const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

	let fromDate = $state<string>(thirtyDaysAgo.toISOString().split('T')[0]);
	let toDate = $state<string>(today.toISOString().split('T')[0]);
	let selectedCategoryIds = $state<number[]>([]);

	function toggleCategory(id: number): void {
		if (selectedCategoryIds.includes(id)) {
			selectedCategoryIds = selectedCategoryIds.filter((c) => c !== id);
		} else {
			selectedCategoryIds = [...selectedCategoryIds, id];
		}
	}

	let filteredProjects = $derived(() => {
		const all = tt.statistics?.by_project ?? [];
		if (selectedCategoryIds.length === 0) return all;
		return all.filter((p) => {
			const project = tt.projects.find((proj) => proj.id === p.project_id);
			return project?.categories.some((c) => selectedCategoryIds.includes(c.id)) ?? false;
		});
	});

	let filteredTotal = $derived(() =>
		filteredProjects().reduce((sum, p) => sum + p.total_minutes, 0)
	);

	let projectDonutData = $derived(
		filteredProjects().map((p) => ({
			value: p.total_minutes,
			name: p.project_title,
			color: p.color
		}))
	);

	let categoryBreakdown = $derived(() => {
		const map = new Map<number, { title: string; minutes: number }>();
		for (const stat of filteredProjects()) {
			const project = tt.projects.find((p) => p.id === stat.project_id);
			if (!project) continue;
			for (const cat of project.categories) {
				const existing = map.get(cat.id) ?? { title: cat.title, minutes: 0 };
				existing.minutes += stat.total_minutes;
				map.set(cat.id, existing);
			}
		}
		return [...map.values()].sort((a, b) => b.minutes - a.minutes);
	});

	let categoryChartLabels = $derived(categoryBreakdown().map((c) => c.title));
	let categoryChartValues = $derived(
		categoryBreakdown().map((c) => Math.round((c.minutes / 60) * 10) / 10)
	);

	onMount(async () => {
		await loadStats();
	});

	async function loadStats(): Promise<void> {
		loadingIndicator.start();
		await tt.loadStatistics(fromDate, toDate);
		loadingIndicator.stop();
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
		<Heading title={ts.get.timeTracking.statistics} my={0} />
		<div class="flex flex-wrap items-end gap-4">
			<div class="flex flex-col gap-1">
				<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
					{ts.get.timeTracking.from}
				</span>
				<input
					type="date"
					bind:value={fromDate}
					class="rounded-lg border-1 border-c-neutral-2 px-3 py-2 text-sm shadow-xs dark:border-s-dark-3 dark:bg-inherit dark:text-white"
				/>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
					{ts.get.timeTracking.to}
				</span>
				<input
					type="date"
					bind:value={toDate}
					class="rounded-lg border-1 border-c-neutral-2 px-3 py-2 text-sm shadow-xs dark:border-s-dark-3 dark:bg-inherit dark:text-white"
				/>
			</div>
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
					onclick={() => (selectedCategoryIds = [])}
					class="rounded-full border px-3 py-1 text-xs font-medium transition-colors
						{selectedCategoryIds.length === 0
						? 'border-c-primary bg-c-primary text-white'
						: 'border-c-neutral-2 text-c-neutral-5 hover:border-c-primary dark:border-s-dark dark:text-c-neutral-4'}"
				>
					{ts.get.timeTracking.all_categories}
				</button>
				{#each tt.categories as category (category.id)}
					<button
						type="button"
						onclick={() => toggleCategory(category.id)}
						class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors
							{selectedCategoryIds.includes(category.id)
							? 'border-transparent text-white'
							: 'border-c-neutral-2 text-c-neutral-5 hover:border-c-primary dark:border-s-dark dark:text-c-neutral-4'}"
						style={selectedCategoryIds.includes(category.id)
							? `background-color: ${category.color ?? '#1dbda5'}; border-color: ${category.color ?? '#1dbda5'}`
							: ''}
					>
						<span
							class="h-2 w-2 shrink-0 rounded-full"
							style="background-color: {category.color ?? '#1dbda5'}"
						></span>
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
				{tt.formatDuration(filteredTotal())}
			</span>
		</div>

		<div class="flex w-full flex-row gap-8 max-md:flex-col">
			{#if projectDonutData.length > 0}
				<div class="w-full md:w-1/2">
					<span class="text-lg font-medium">{ts.get.timeTracking.projects}</span>
					<DoughnutChart
						values={projectDonutData}
						centerFormatter={tt.formatDuration}
						valueFormatter={tt.formatDuration}
					/>
				</div>
			{/if}
			{#if categoryChartLabels.length > 0}
				<div class="w-full md:w-1/2">
					<span class="text-lg font-medium">{ts.get.timeTracking.categories}</span>
					<BarChart
						categories={categoryChartLabels}
						values={categoryChartValues}
						valueFormatter={(v) => tt.formatDuration(Math.round(v * 60))}
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>
