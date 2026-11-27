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
		name: 'decimals-arrow-left',
		size: 24,
		node: [
			['path', { d: 'm13 21-3-3 3-3' }],
			['path', { d: 'M20 18H10' }],
			['path', { d: 'M3 11h.01' }],
			['rect', { x: '6', y: '3', width: '5', height: '8', rx: '2.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
