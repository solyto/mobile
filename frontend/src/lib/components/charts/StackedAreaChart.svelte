<script lang="ts">
	import { init } from './echarts';
	import type { ECharts } from './echarts';
	import { onMount } from 'svelte';

	let { title, xCategories, dataPoints, valueFormatter }: {
		title?: string;
		xCategories: string[];
		dataPoints: { title: string; values: number[] }[];
		valueFormatter?: (value: number) => string;
	} = $props();

	let chartContainer: HTMLDivElement;
	let chart = $state<ECharts | null>(null);

	function options() {
		return {
			title: {
				text: title || ''
			},
			tooltip: {
				trigger: 'axis',
				valueFormatter: valueFormatter ? (value: unknown) => valueFormatter(Number(value)) : undefined
			},
			legend: {
				type: 'scroll',
				top: 0,
				padding: 0,
				left: 0,
				right: 0,
				data: dataPoints.map((p: { title: string; values: number[] }) => p.title)
			},
			grid: {
				top: 40,
				left: 0,
				right: 0,
				bottom: 0,
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: xCategories
			},
			yAxis: {
				type: 'value'
			},
			series: dataPoints.map((p: { title: string; values: number[] }) => ({
				name: p.title,
				type: 'line',
				areaStyle: {},
				smooth: true,
				lineStyle: {
					width: 0
				},
				data: p.values,
				stack: 'Total',
				emphasis: {
					focus: 'series'
				}
			}))
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
		if (!xCategories?.length || !dataPoints?.length) {
			chart?.clear();
			return;
		}

		chart?.setOption(options(), true);
	});
</script>

<div bind:this={chartContainer} class="h-128 w-full"></div>
