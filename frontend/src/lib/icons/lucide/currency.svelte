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
		name: 'currency',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '8' }],
			['line', { x1: '3', x2: '6', y1: '3', y2: '6' }],
			['line', { x1: '21', x2: '18', y1: '3', y2: '6' }],
			['line', { x1: '3', x2: '6', y1: '21', y2: '18' }],
			['line', { x1: '21', x2: '18', y1: '21', y2: '18' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
