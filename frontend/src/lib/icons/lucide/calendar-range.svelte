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
		name: 'calendar-range',
		size: 24,
		node: [
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
			['path', { d: 'M16 2v3' }],
			['path', { d: 'M3 9h18' }],
			['path', { d: 'M8 2v3' }],
			['path', { d: 'M17 13h-6' }],
			['path', { d: 'M13 17H7' }],
			['path', { d: 'M7 13h.01' }],
			['path', { d: 'M17 17h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
