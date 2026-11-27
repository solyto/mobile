<script lang="ts">
	import { init } from './echarts';
	import type { ECharts } from './echarts';
	import { onMount } from 'svelte';
	import { resolveCssColor } from '$lib/helpers/ColorHelper';

	let {
		title,
		categories,
		values,
		colors,
		opacity = 1,
		valueFormatter = (v: number) => String(v)
	}: {
		title?: string;
		categories?: string[];
		values?: number[];
		colors?: string[];
		opacity?: number;
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
				formatter: (params: { name: string; value: number }[]) =>
					`${params[0].name}: ${valueFormatter(params[0].value)}`
			},
			grid: {
				top: title ? 60 : 8,
				left: 0,
				right: 0,
				bottom: 0,
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: categories
			},
			yAxis: {
				type: 'value'
			},
			series: [
				{
					type: 'bar',
					data: colors
						? (values ?? []).map((value: number, i: number) => ({
								value,
								itemStyle: { color: resolveCssColor(colors[i]) }
							}))
						: values,
					itemStyle: {
						color: '#61d96a',
						opacity
					}
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
		if (!categories?.length || !values?.length) {
			chart?.clear();
			return;
		}

		chart?.setOption(options(), true);
	});
</script>

<div bind:this={chartContainer} class="h-96 w-full"></div>
