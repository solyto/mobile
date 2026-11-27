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
		name: 'sheet',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
			['line', { x1: '3', x2: '21', y1: '9', y2: '9' }],
			['line', { x1: '3', x2: '21', y1: '15', y2: '15' }],
			['line', { x1: '9', x2: '9', y1: '9', y2: '21' }],
			['line', { x1: '15', x2: '15', y1: '9', y2: '21' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
