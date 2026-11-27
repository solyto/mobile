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
		name: 'scan-qr-code',
		size: 24,
		node: [
			['path', { d: 'M17 12v4a1 1 0 0 1-1 1h-4' }],
			['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
			['path', { d: 'M17 8V7' }],
			['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
			['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
			['path', { d: 'M7 17h.01' }],
			['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
			['rect', { x: '7', y: '7', width: '5', height: '5', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
