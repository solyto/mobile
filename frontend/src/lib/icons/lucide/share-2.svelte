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
		name: 'share-2',
		size: 24,
		node: [
			['circle', { cx: '18', cy: '5', r: '3' }],
			['circle', { cx: '6', cy: '12', r: '3' }],
			['circle', { cx: '18', cy: '19', r: '3' }],
			['line', { x1: '8.59', x2: '15.42', y1: '13.51', y2: '17.49' }],
			['line', { x1: '15.41', x2: '8.59', y1: '6.51', y2: '10.49' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
