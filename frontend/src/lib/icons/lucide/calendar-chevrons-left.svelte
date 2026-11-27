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
		name: 'calendar-chevrons-left',
		size: 24,
		node: [
			['path', { d: 'm11 21-3-3 3-3' }],
			['path', { d: 'M16 2v3' }],
			['path', { d: 'M21 9H3' }],
			['path', { d: 'M3 11.5V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2h-4' }],
			['path', { d: 'm5 21-3-3 3-3' }],
			['path', { d: 'M8 2v3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
