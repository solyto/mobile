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
		name: 'server',
		size: 24,
		node: [
			['rect', { width: '20', height: '8', x: '2', y: '2', rx: '2', ry: '2' }],
			['rect', { width: '20', height: '8', x: '2', y: '14', rx: '2', ry: '2' }],
			['line', { x1: '6', x2: '6.01', y1: '6', y2: '6' }],
			['line', { x1: '6', x2: '6.01', y1: '18', y2: '18' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
