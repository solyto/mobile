<!--
@lucide/svelte v1.59.0 - ISC

This source code is licensed under the ISC license.
See the LICENSE file in this directory.
-->
<script lang="ts">
	import Icon from './Icon.svelte';
	import type { LucideIconData, LucideProps } from './types';

	const props: LucideProps = $props();

	const iconData: LucideIconData = {
		name: 'chart-scatter',
		size: 24,
		node: [
			['circle', { cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor' }],
			['circle', { cx: '18.5', cy: '5.5', r: '.5', fill: 'currentColor' }],
			['circle', { cx: '11.5', cy: '11.5', r: '.5', fill: 'currentColor' }],
			['circle', { cx: '7.5', cy: '16.5', r: '.5', fill: 'currentColor' }],
			['circle', { cx: '17.5', cy: '14.5', r: '.5', fill: 'currentColor' }],
			['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }]
		],
		aliases: ['scatter-chart']
	};
</script>

<Icon {...props} icon={iconData} />
