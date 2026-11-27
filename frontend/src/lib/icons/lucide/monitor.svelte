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
		name: 'monitor',
		size: 24,
		node: [
			['rect', { width: '20', height: '14', x: '2', y: '3', rx: '2' }],
			['line', { x1: '8', x2: '16', y1: '21', y2: '21' }],
			['line', { x1: '12', x2: '12', y1: '17', y2: '21' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
