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
		name: 'timer',
		size: 24,
		node: [
			['line', { x1: '10', x2: '14', y1: '2', y2: '2' }],
			['line', { x1: '12', x2: '15', y1: '14', y2: '11' }],
			['circle', { cx: '12', cy: '14', r: '8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
