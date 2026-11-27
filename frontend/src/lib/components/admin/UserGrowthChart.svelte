<script lang="ts">
	import type { UserGrowthGroupBy, UserGrowthPoint } from '$lib/types/managed_user';
	import type { AdminRecords } from '$lib/types/translation';
	import SmoothLineChart from '$lib/components/charts/SmoothLineChart.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { formatGrowthPeriod } from '$lib/helpers/UserGrowthHelper';

	let {
		points,
		groupBy,
		ongroupby
	}: {
		points: UserGrowthPoint[];
		groupBy: UserGrowthGroupBy;
		ongroupby: (groupBy: UserGrowthGroupBy) => void;
	} = $props();

	const ts = getTranslation();

	const filters: { key: UserGrowthGroupBy; label: keyof AdminRecords }[] = [
		{ key: 'year', label: 'growth_by_year' },
		{ key: 'month', label: 'growth_by_month' },
		{ key: 'week', label: 'growth_by_week' },
		{ key: 'day', label: 'growth_by_day' }
	];
</script>

<div
	class="rounded-xl border border-c-neutral-1 bg-c-bg-surface p-6 shadow-sm dark:border-s-dark-3"
>
	<div class="mb-4 flex items-center justify-between">
		<h3
			class="text-sm font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5"
		>
			{ts.get.admin.growth_title}
		</h3>
		<div class="flex items-center gap-1">
			{#each filters as filter (filter.key)}
				<button
					class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
					class:bg-c-btn={groupBy === filter.key}
					class:text-c-btn-text={groupBy === filter.key}
					class:bg-c-neutral-1={groupBy !== filter.key}
					class:dark:bg-s-dark-3={groupBy !== filter.key}
					onclick={() => ongroupby(filter.key)}
				>
					{ts.get.admin[filter.label]}
				</button>
			{/each}
		</div>
	</div>
	{#key groupBy}
		<SmoothLineChart
			categories={points.map((point) => formatGrowthPeriod(point.period, groupBy))}
			values={points.map((point) => point.total)}
			filled={true}
			color="var(--color-c-success)"
		/>
	{/key}
</div>
