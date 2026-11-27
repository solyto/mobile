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
		name: 'credit-card',
		size: 24,
		node: [
			['rect', { width: '20', height: '14', x: '2', y: '5', rx: '2' }],
			['line', { x1: '2', x2: '22', y1: '10', y2: '10' }],
			['path', { d: 'M6 14h2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
