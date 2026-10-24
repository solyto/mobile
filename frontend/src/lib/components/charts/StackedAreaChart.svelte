<script lang="ts">
	import { init } from './echarts';
	import type { ECharts } from './echarts';
	import { onMount, onDestroy, tick } from 'svelte';

	let { title, xCategories, dataPoints }: {
		title?: string;
		xCategories: string[];
		dataPoints: { title: string; values: number[] }[];
	} = $props();

	let chartContainer: HTMLDivElement | null = null;
	let myChart: ECharts | null = null;
	let isInitialized = false;

	/*
		Fields: categories
		Legend: Fields
		Values: series
	 */

	function createChart() {
		if (!chartContainer || !xCategories?.length || !dataPoints?.length) return;

		if (myChart) {
			myChart.dispose();
			myChart = null;
		}

		myChart = init(chartContainer);

		const options = {
			title: {
				text: title || ''
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

		myChart.setOption(options);
		isInitialized = true;
	}

	onMount(() => {
		tick().then(createChart);

		const handleResize = () => {
			if (myChart) {
				myChart.resize();
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	onDestroy(() => {
		if (myChart) {
			myChart.dispose();
			myChart = null;
		}
	});

	$effect(() => {
		if (!isInitialized && chartContainer) {
			createChart();
		}
	});
</script>

<div bind:this={chartContainer} class="h-128 w-full"></div>
