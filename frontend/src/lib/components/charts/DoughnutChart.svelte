<script lang="ts">
	import { init } from './echarts';
	import type { ECharts } from './echarts';
	import { onMount } from 'svelte';
	import { getChartColor } from '$lib/helpers/ColorHelper';

	function plainNumber(value: number): string {
		return String(value);
	}

	let {
		title,
		values,
		centerFormatter = plainNumber,
		valueFormatter = plainNumber
	}: {
		title?: string;
		values?: { value: number; name: string; color?: string | null }[];
		centerFormatter?: (total: number) => string;
		valueFormatter?: (value: number) => string;
	} = $props();

	let chartContainer: HTMLDivElement;
	let chart = $state<ECharts | null>(null);
	let hiddenNames = $state<string[]>([]);

	function toggleEntry(name: string) {
		hiddenNames = hiddenNames.includes(name) ? hiddenNames.filter((hidden) => hidden !== name) : [...hiddenNames, name];
	}

	function options(values: { value: number; name: string; color?: string | null }[]) {
		const total = values.reduce((sum: number, item: { value: number; name: string; color?: string | null }) => sum + item.value, 0);

		return {
			title: [
				{
					text: title || ''
				},
				{
					text: centerFormatter(total),
					left: 'center',
					top: '50%',
					textVerticalAlign: 'middle',
					textStyle: {
						color: '#333',
						fontSize: 20,
						fontWeight: 'bold'
					}
				}
			],
			tooltip: {
				trigger: 'item',
				formatter: (params: { name: string; value: number; percent: number }) =>
					`${params.name}: ${valueFormatter(params.value)} (${params.percent}%)`
			},
			legend: {
				show: false,
				selected: Object.fromEntries(values.map((v) => [v.name, !hiddenNames.includes(v.name)]))
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			series: [
				{
					type: 'pie',
					radius: ['50%', '90%'],
					center: ['50%', '50%'],
					avoidLabelOverlap: false,
					itemStyle: {
						borderRadius: 5
					},
					label: {
						show: false,
						position: 'center'
					},
					labelLine: {
						show: false
					},
					data: values.map((v: { value: number; name: string; color?: string | null }, index: number) => ({
						value: v.value,
						name: v.name,
						itemStyle: { color: getChartColor(index, v.color) }
					}))
				}
			]
		};
	}

	onMount(() => {
		const instance = init(chartContainer);
		const handleResize = () => instance.resize();
		chart = instance;
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			instance.dispose();
		};
	});

	$effect(() => {
		if (!values?.length) {
			chart?.clear();
			return;
		}

		chart?.setOption(options(values));
	});
</script>

<div bind:this={chartContainer} class="h-80 w-full"></div>
{#if values?.length}
	<ul class="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
		{#each values as entry, index (index)}
			<li>
				<button
					type="button"
					class="flex items-center gap-2 text-sm text-c-neutral-5 dark:text-c-neutral-4"
					class:opacity-40={hiddenNames.includes(entry.name)}
					aria-pressed={!hiddenNames.includes(entry.name)}
					onclick={() => toggleEntry(entry.name)}
				>
					<span class="h-3.5 w-6 shrink-0 rounded-sm" style="background-color: {getChartColor(index, entry.color)}"></span>
					{entry.name}
				</button>
			</li>
		{/each}
	</ul>
{/if}
