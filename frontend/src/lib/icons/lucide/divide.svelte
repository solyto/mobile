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
		name: 'divide',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '6', r: '1' }],
			['line', { x1: '5', x2: '19', y1: '12', y2: '12' }],
			['circle', { cx: '12', cy: '18', r: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
