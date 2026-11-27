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
		name: 'scan-box',
		size: 24,
		node: [
			['path', { d: 'M12 12v5.5' }],
			['path', { d: 'M17 3h2a2 2 0 012 2v2' }],
			['path', { d: 'M21 17v2a2 2 0 01-2 2h-2' }],
			['path', { d: 'M3 7V5a2 2 0 012-2h2' }],
			['path', { d: 'M7 21H5a2 2 0 01-2-2v-2' }],
			['path', { d: 'M7.264 9.252 12 12l4.737-2.748' }],
			['path', { d: 'M7.995 8.514A2 2 0 007 10.244v3.516a2 2 0 00.996 1.73l3 1.74a2 2 0 002.008 0l3-1.74A2 2 0 0017 13.76v-3.517a2 2 0 00-.995-1.73l-3-1.742a2 2 0 00-1.892-.064z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
