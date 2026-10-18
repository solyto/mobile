<script lang="ts">
	import { onMount } from 'svelte';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import DateInput from '$lib/components/forms/DateInput.svelte';
	import { getReadableTextColor } from '$lib/helpers/ColorHelper';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	function toLocalDateValue(date: Date): string {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	const today = new Date();
	const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);

	let fromDate = $state<string>(toLocalDateValue(thirtyDaysAgo));
	let toDate = $state<string>(toLocalDateValue(today));
	let selectedCategoryIds = $state<number[]>([]);

	async function toggleCategory(id: number): Promise<void> {
		if (selectedCategoryIds.includes(id)) {
			selectedCategoryIds = selectedCategoryIds.filter((c) => c !== id);
		} else {
			selectedCategoryIds = [...selectedCategoryIds, id];
		}
		await loadStats();
	}

	let filteredProjects = $derived(tt.statistics?.by_project ?? []);

	let projectDonutData = $derived(
		filteredProjects.map((p) => ({
			value: p.total_minutes,
			name: p.project_title,
			color: p.color
		}))
	);

	let categoryBreakdown = $derived.by(() => {
		const map = new Map<number, { title: string; minutes: number }>();
		for (const stat of filteredProjects) {
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

	let categoryChartLabels = $derived(categoryBreakdown.map((c) => c.title));

	onMount(async () => {
		await loadStats();
	});

	async function loadStats(): Promise<void> {
		loadingIndicator.start();
		await tt.loadStatistics(fromDate, toDate, selectedCategoryIds);
		loadingIndicator.stop();
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-start">
		<Heading title={ts.get.timeTracking.statistics} my={0} />
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
					onclick={async () => {
						selectedCategoryIds = [];
						await loadStats();
					}}
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
							? 'border-transparent'
							: 'border-c-neutral-2 text-c-neutral-5 hover:border-c-primary dark:border-s-dark dark:text-c-neutral-4'}"
						style={selectedCategoryIds.includes(category.id)
							? `background-color: ${category.color ?? 'var(--color-c-primary)'}; border-color: ${category.color ?? 'var(--color-c-primary)'}; color: ${getReadableTextColor(category.color ?? 'var(--color-c-primary)')}`
							: ''}
					>
						<span
							class="h-2 w-2 shrink-0 rounded-full"
							style="background-color: {category.color ?? 'var(--color-c-primary)'}"
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
				{tt.formatDuration(filteredProjects.reduce((sum, p) => sum + p.total_minutes, 0))}
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
						values={categoryBreakdown.map((c) => c.minutes)}
						valueFormatter={(v) => tt.formatDuration(v)}
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>
