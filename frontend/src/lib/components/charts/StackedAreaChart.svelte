<script lang="ts">
	import { init } from 'echarts';
	import type { ECharts } from 'echarts';
	import { onMount, onDestroy, tick } from 'svelte';

	let { title, xCategories, dataPoints } = $props<{
		title?: string;
		xCategories: string[];
		dataPoints: { title: string; values: number[] }[];
	}>();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let myChart = $state<ECharts | null>(null);
	let isInitialized = $state<boolean>(false);

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
				data: dataPoints.map((p: { title: string; values: number[] }) => p.title)
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '10%',
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

	// Only update when data actually changes, not on every render
	$effect(() => {
		if (!isInitialized && chartContainer) {
			createChart();
		}
	});
</script>

<div bind:this={chartContainer} class="h-128 w-full"></div>
