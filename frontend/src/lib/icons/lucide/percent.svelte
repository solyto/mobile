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
		name: 'percent',
		size: 24,
		node: [
			['line', { x1: '19', x2: '5', y1: '5', y2: '19' }],
			['circle', { cx: '6.5', cy: '6.5', r: '2.5' }],
			['circle', { cx: '17.5', cy: '17.5', r: '2.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
