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
		name: 'wifi-lock',
		size: 24,
		node: [
			['path', { d: 'M2 8.82a15 15 0 0120 0' }],
			['path', { d: 'M20 16v-2a2 2 0 00-4 0v2' }],
			['path', { d: 'M5 12.859a10 10 0 018.436-2.756' }],
			['path', { d: 'M8.5 16.429a5 5 0 011.794-1.13' }],
			['rect', { x: '14', y: '16', width: '8', height: '5', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
