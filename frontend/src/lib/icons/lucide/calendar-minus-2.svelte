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
		name: 'calendar-minus-2',
		size: 24,
		node: [
			['path', { d: 'M8 2v3' }],
			['path', { d: 'M16 2v3' }],
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
			['path', { d: 'M3 9h18' }],
			['path', { d: 'M10 15h4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
