<script lang="ts">
	import { init } from 'echarts';
	import type { ECharts } from 'echarts';
	import { onMount, onDestroy, tick } from 'svelte';
	import { europeanFormat } from '$lib/helpers/NumberHelper';

	let {
		title,
		values,
		centerFormatter = europeanFormat,
		valueFormatter = europeanFormat
	} = $props<{
		title?: string;
		values?: { value: number; name: string; color?: string | null }[];
		centerFormatter?: (total: number) => string;
		valueFormatter?: (value: number) => string;
	}>();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let myChart = $state<ECharts | null>(null);
	let isInitialized = $state<boolean>(false);

	function createChart() {
		if (!chartContainer || !values?.length) return;

		if (myChart) {
			myChart.dispose();
			myChart = null;
		}

		myChart = init(chartContainer);

		const total = values.reduce((sum: number, item: { value: number; name: string; color?: string | null }) => sum + item.value, 0);

		const options = {
			title: {
				text: title || ''
			},
			tooltip: {
				trigger: 'item',
				formatter: (params: { name: string; value: number; percent: number }) =>
					`${params.name}: ${valueFormatter(params.value)} (${params.percent}%)`
			},
			legend: {
				bottom: '0',
				left: 'center'
			},
			graphic: [
				{
					type: 'text',
					left: 'center',
					top: 'middle',
					style: {
						text: centerFormatter(total),
						textAlign: 'center',
						fill: '#333',
						fontSize: 20,
						fontWeight: 'bold'
					}
				}
			],
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			series: [
				{
					type: 'pie',
					radius: ['40%', '70%'],
					avoidLabelOverlap: false,
					itemStyle: {
						borderRadius: 5,
					},
					label: {
						show: false,
						position: 'center'
					},
					labelLine: {
						show: false
					},
					data: values.map((v: { value: number; name: string; color?: string | null }) => ({
						value: v.value,
						name: v.name,
						...(v.color ? { itemStyle: { color: v.color } } : {})
					}))
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

<div bind:this={chartContainer} class="h-96 w-full"></div>
