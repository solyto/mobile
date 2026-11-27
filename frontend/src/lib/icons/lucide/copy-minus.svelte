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
		name: 'copy-minus',
		size: 24,
		node: [
			['line', { x1: '12', x2: '18', y1: '15', y2: '15' }],
			['rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }],
			['path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
