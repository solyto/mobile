<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import SubHeading from '$lib/components/ui/SubHeading.svelte';
	import { getFinances } from '$lib/state/Finances.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { europeanFormat } from '$lib/helpers/NumberHelper.js';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { urls } from '$lib/config/urls';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import SmoothLineChart from '$lib/components/charts/SmoothLineChart.svelte';
	import WealthStatisticsService from '$lib/services/WealthStatisticsService';

	const ts = getTranslation();
	const finances = getFinances();
	const auth = getAuth();

	let colorLoaded = $state<boolean>(false);
	const statisticsService = new WealthStatisticsService();
	let statistics = $derived.by(() => {
		if (!finances.wealthLoaded) return [];
		statisticsService.setData(finances.wealth);
		return statisticsService.getGraphValues() as unknown as {
			date: string;
			values: { field: string; value: number }[];
		}[];
	});

	onMount(() => {
		setTimeout(() => {
			colorLoaded = true;
		}, 100);
	});

	function getTotalSeriesData(stats: typeof statistics) {
		if (stats.length === 0) return [];
		return stats.map((stat) => stat.values.reduce((sum, v) => sum + v.value, 0));
	}
</script>

<div class="flex w-full flex-col gap-4">
	{#if finances.wealthLoaded && finances.budgetLoaded}
		<div in:fade>
			<div class="flex w-full flex-row items-start gap-4 max-md:flex-col">
				<button
					type="button"
					class="relative w-full cursor-pointer rounded-md p-4 shadow-sm transition-all hover:bg-d-lighterblue dark:shadow-s-dark-shadow dark:hover:bg-s-dark-3 md:dark:bg-s-dark-2"
					onclick={() => goto(resolve(urls.budget))}
				>
					<div class="flex w-full flex-col items-start gap-1">
						<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.finances.budget}</span>
						<span class="text-3xl tabular-nums md:text-4xl"
							>{europeanFormat(finances.getBudgetTotal())}</span
						>
					</div>
				</button>
				<button
					type="button"
					class="relative w-full cursor-pointer rounded-md p-4 shadow-sm transition-all hover:bg-d-lighterblue dark:shadow-s-dark-shadow dark:hover:bg-s-dark-3 md:dark:bg-s-dark-2"
					class:border-c-success={colorLoaded && finances.getWealthSum() > 0}
					class:border-c-danger={colorLoaded && finances.getWealthSum() < 0}
					onclick={() => goto(resolve(urls.wealth))}
				>
					<div class="flex w-full flex-col items-start gap-1">
						<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.finances.wealth}</span>
						<span class="text-3xl tabular-nums md:text-4xl"
							>{europeanFormat(finances.getWealthSum())}</span
						>
					</div>
				</button>
			</div>
		</div>

		<div class="flex w-full flex-row gap-4 max-md:flex-col" in:slide>
			<div class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2 ">
				<SubHeading title={ts.get.finances.income_vs_expenses} my={0} mb={8} />
				<div>
					<BarChart
						categories={[ts.get.finances.income, ts.get.finances.expenses]}
						values={[finances.getBudgetIncomeTotal(), finances.getBudgetExpenseTotal()]}
						colors={['var(--color-c-success)', 'var(--color-c-danger)']}
						opacity={0.8}
					/>
				</div>
			</div>

			{#if finances.wealth.length > 0}
				<div class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2">
					<SubHeading title={ts.get.finances.wealth_distribution} my={0} mb={4} />
					<div>
						<DoughnutChart
							values={finances.wealth.map((wealth) => ({
								value: wealth.currentValue?.value ?? 0,
								name: wealth.title
							}))}
						/>
					</div>
				</div>
			{/if}
		</div>

		{#if statistics.length > 0}
			<div
				class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
				in:slide
			>
				<SubHeading title={ts.get.finances.wealth_trend} my={0} mb={8} />
				<div>
					<SmoothLineChart
						categories={statisticsService.getMonthLabels(statistics, auth.user?.settings?.date_format ?? null)}
						values={getTotalSeriesData(statistics)}
						min={statisticsService.getTrendMin(getTotalSeriesData(statistics))}
						filled={true}
					/>
				</div>
			</div>
		{/if}
	{/if}
</div>
