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
		name: 'door-closed-locked',
		size: 24,
		node: [
			['path', { d: 'M19 8V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' }],
			['path', { d: 'M2 21h8' }],
			['path', { d: 'M20 16v-2a2 2 0 00-4 0v2' }],
			['path', { d: 'M9 12h.01' }],
			['rect', { x: '14', y: '16', width: '8', height: '5', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
