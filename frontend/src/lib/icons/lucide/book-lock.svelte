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
		name: 'book-lock',
		size: 24,
		node: [
			['path', { d: 'M18 6V4a2 2 0 1 0-4 0v2' }],
			['path', { d: 'M20 15v6a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20' }],
			['path', { d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H10' }],
			['rect', { x: '12', y: '6', width: '8', height: '5', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
