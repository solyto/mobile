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
		name: 'tablet',
		size: 24,
		node: [
			['rect', { width: '16', height: '20', x: '4', y: '2', rx: '2', ry: '2' }],
			['line', { x1: '12', x2: '12.01', y1: '18', y2: '18' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
