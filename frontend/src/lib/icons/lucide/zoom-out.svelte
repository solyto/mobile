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
		name: 'zoom-out',
		size: 24,
		node: [
			['circle', { cx: '11', cy: '11', r: '8' }],
			['line', { x1: '21', x2: '16.65', y1: '21', y2: '16.65' }],
			['line', { x1: '8', x2: '14', y1: '11', y2: '11' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
