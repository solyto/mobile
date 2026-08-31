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
		color = '#61d96a',
		class: extraClass = 'h-96'
	} = $props<{
		title?: string;
		categories?: string[];
		values?: number[];
		min?: number;
		max?: number;
		filled?: boolean;
		color?: string;
		class?: string;
	}>();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let myChart = $state<ECharts | null>(null);
	let isInitialized = $state<boolean>(false);

	// echarts renders to canvas, so CSS variables like var(--color-c-success) must be
	// resolved to a concrete color value before being passed to the chart options.
	function resolveColor(cssColor: string): string {
		const probe = document.createElement('div');
		probe.style.color = cssColor;
		document.body.appendChild(probe);
		const resolved = getComputedStyle(probe).color;
		document.body.removeChild(probe);
		return resolved;
	}

	function withAlpha(rgb: string, alpha: number): string {
		// rgb()/rgba() computed value, e.g. "rgb(97, 217, 106)"
		const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		if (match) {
			return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
		}
		return rgb;
	}

	function createChart() {
		if (!chartContainer || !categories?.length || !values?.length) return;

		if (myChart) {
			myChart.dispose();
			myChart = null;
		}

		myChart = init(chartContainer);

		const lineColor = resolveColor(color);

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
