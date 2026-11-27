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
		name: 'wallet-cards',
		size: 24,
		node: [
			['path', { d: 'M3 11h3.75a2 2 0 0 1 1.6.8l.45.6a4 4 0 0 0 6.4 0l.45-.6a2 2 0 0 1 1.6-.8H21' }],
			['path', { d: 'M3 7h18' }],
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
