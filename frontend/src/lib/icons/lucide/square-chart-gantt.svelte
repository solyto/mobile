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
		name: 'square-chart-gantt',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
			['path', { d: 'M9 8h7' }],
			['path', { d: 'M8 12h6' }],
			['path', { d: 'M11 16h5' }]
		],
		aliases: ['gantt-chart-square', 'square-gantt-chart']
	};
</script>

<Icon {...props} icon={iconData} />
