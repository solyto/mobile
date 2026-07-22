<script lang="ts">
	import { init } from 'echarts';
	import type { ECharts } from 'echarts';
	import { onMount, onDestroy, tick } from 'svelte';

	let {
		title,
		categories,
		values,
		min,
		max,
		filled = false,
		class: extraClass = 'h-96'
	} = $props<{
		title?: string;
		categories?: string[];
		values?: number[];
		min?: number;
		max?: number;
		filled?: boolean;
		class?: string;
	}>();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let myChart = $state<ECharts | null>(null);
	let isInitialized = $state<boolean>(false);

	function createChart() {
		if (!chartContainer || !categories?.length || !values?.length) return;

		if (myChart) {
			myChart.dispose();
			myChart = null;
		}

		myChart = init(chartContainer);

		const options = {
			title: {
				text: title || ''
			},
			tooltip: {
				trigger: 'axis'
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '10%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: categories
			},
			yAxis: {
				type: 'value',
				...(min !== undefined ? { min } : {}),
				...(max !== undefined ? { max } : {})
			},
			series: [
				{
					type: 'line',
					smooth: true,
					data: values,
					itemStyle: {
						color: '#61d96a'
					},
					lineStyle: {
						width: 2.5,
						color: '#61d96a'
					},
					...(filled
						? {
								areaStyle: {
									color: {
										type: 'linear',
										x: 0, y: 0, x2: 0, y2: 1,
										colorStops: [
											{ offset: 0, color: 'rgba(97, 217, 106, 0.25)' },
											{ offset: 1, color: 'rgba(97, 217, 106, 0.02)' }
										]
									}
								}
							}
						: {})
				}
			]
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

<div bind:this={chartContainer} class="w-full {extraClass}"></div>
