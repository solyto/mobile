<script lang="ts">
	import { init } from './echarts';
	import type { ECharts } from './echarts';
	import { onMount } from 'svelte';
	import { resolveCssColor, withAlpha } from '$lib/helpers/ColorHelper';

	let {
		title,
		categories,
		values,
		min,
		max,
		filled = false,
		color = '#61d96a',
		valueFormatter,
		class: extraClass = 'h-96'
	}: {
		title?: string;
		categories?: string[];
		values?: number[];
		min?: number;
		max?: number;
		filled?: boolean;
		color?: string;
		valueFormatter?: (value: number) => string;
		class?: string;
	} = $props();

	let chartContainer: HTMLDivElement;
	let chart = $state<ECharts | null>(null);

	function options() {
		const lineColor = resolveCssColor(color);

		return {
			title: {
				text: title || ''
			},
			tooltip: {
				trigger: 'axis',
				valueFormatter: valueFormatter ? (value: unknown) => valueFormatter(Number(value)) : undefined
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
						color: lineColor
					},
					lineStyle: {
						width: 2.5,
						color: lineColor
					},
					...(filled
						? {
								areaStyle: {
									color: {
										type: 'linear',
										x: 0, y: 0, x2: 0, y2: 1,
										colorStops: [
											{ offset: 0, color: withAlpha(lineColor, 0.25) },
											{ offset: 1, color: withAlpha(lineColor, 0.02) }
										]
									}
								}
							}
						: {})
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

<div bind:this={chartContainer} class="w-full {extraClass}"></div>
