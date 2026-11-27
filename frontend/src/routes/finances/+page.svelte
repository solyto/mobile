<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import SubHeading from '$lib/components/ui/SubHeading.svelte';
	import { getFinances } from '$lib/state/Finances.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { formatUserMoney, userMoneyFormatKey } from '$lib/helpers/NumberHelper.js';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { urls } from '$lib/config/urls';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import SmoothLineChart from '$lib/components/charts/SmoothLineChart.svelte';
	import WealthStatisticsService, { wealthRanges, type WealthRangeKey } from '$lib/services/WealthStatisticsService';
	import WealthRangeControl from '$lib/components/finances/WealthRangeControl.svelte';

	const ts = getTranslation();
	const finances = getFinances();
	const auth = getAuth();

	const statisticsService = new WealthStatisticsService();
	const COLOR_DELAY_MS = 100;

	let colorLoaded = $state<boolean>(false);
	let range = $state<WealthRangeKey>('1y');
	let statistics = $derived(finances.wealthLoaded ? statisticsService.getGraphValues(finances.wealth, wealthRanges[range]) : []);
	let totals = $derived(statisticsService.getTotals(statistics));

	onMount(() => {
		setTimeout(() => {
			colorLoaded = true;
		}, COLOR_DELAY_MS);
	});

	function openBudget(): void {
		goto(resolve(urls.budget));
	}

	function openWealth(): void {
		goto(resolve(urls.wealth));
	}

	function dateFormat(): string | null {
		return auth.user?.settings?.date_format ?? null;
	}

	function formatMoney(value: number): string {
		return formatUserMoney(value, auth.user?.settings);
	}
</script>

<div class="flex w-full flex-col gap-4">
	{#if finances.wealthLoaded && finances.budgetLoaded}
		<div in:fade>
			<div class="flex w-full flex-row items-start gap-4 max-md:flex-col">
				<button
					type="button"
					class="relative w-full cursor-pointer rounded-md p-4 shadow-sm transition-all hover:bg-d-lighterblue dark:shadow-s-dark-shadow dark:hover:bg-s-dark-3 md:dark:bg-s-dark-2"
					onclick={openBudget}
				>
					<div class="flex w-full flex-col items-start gap-1">
						<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.finances.budget}</span>
						<span class="text-3xl tabular-nums md:text-4xl">{formatMoney(finances.getBudgetTotal())}</span>
					</div>
				</button>
				<button
					type="button"
					class="relative w-full cursor-pointer rounded-md p-4 shadow-sm transition-all hover:bg-d-lighterblue dark:shadow-s-dark-shadow dark:hover:bg-s-dark-3 md:dark:bg-s-dark-2"
					class:border-c-success={colorLoaded && finances.getWealthSum() > 0}
					class:border-c-danger={colorLoaded && finances.getWealthSum() < 0}
					onclick={openWealth}
				>
					<div class="flex w-full flex-col items-start gap-1">
						<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.finances.wealth}</span>
						<span class="text-3xl tabular-nums md:text-4xl">{formatMoney(finances.getWealthSum())}</span>
					</div>
				</button>
			</div>
		</div>

		<div class="flex w-full flex-row gap-4 max-md:flex-col" in:slide>
			<div class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2">
				<SubHeading title={ts.get.finances.income_vs_expenses} my={0} mb={8} />
				<div>
					<BarChart
						categories={[ts.get.finances.income, ts.get.finances.expenses]}
						values={[finances.getBudgetIncomeTotal(), finances.getBudgetExpenseTotal()]}
						colors={['var(--color-c-success)', 'var(--color-c-danger)']}
						opacity={0.8}
						valueFormatter={formatMoney}
					/>
				</div>
			</div>

			{#if finances.wealth.length > 0}
				<div class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2">
					<SubHeading title={ts.get.finances.wealth_distribution} my={0} mb={4} />
					<div>
						{#key userMoneyFormatKey(auth.user?.settings)}
							<DoughnutChart
								values={statisticsService.getDistribution(finances.wealth)}
								centerFormatter={formatMoney}
								valueFormatter={formatMoney}
							/>
						{/key}
					</div>
				</div>
			{/if}
		</div>

		{#if statistics.length > 0}
			<div
				class="relative w-full rounded-md p-4 shadow-sm dark:shadow-s-dark-shadow md:dark:bg-s-dark-2"
				in:slide
			>
				<div class="mb-8 flex flex-wrap items-center justify-between gap-2">
					<SubHeading title={ts.get.finances.wealth_trend} my={0} />
					<WealthRangeControl bind:value={range} />
				</div>
				<div>
					<SmoothLineChart
						categories={statisticsService.getMonthLabels(statistics, dateFormat())}
						values={totals}
						min={statisticsService.getTrendMin(totals)}
						valueFormatter={formatMoney}
						filled={true}
					/>
				</div>
			</div>
		{/if}
	{/if}
</div>
