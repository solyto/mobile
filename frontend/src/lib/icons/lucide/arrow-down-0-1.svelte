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
		name: 'arrow-down-0-1',
		size: 24,
		node: [
			['path', { d: 'm3 16 4 4 4-4' }],
			['path', { d: 'M7 20V4' }],
			['rect', { x: '15', y: '4', width: '4', height: '6', ry: '2' }],
			['path', { d: 'M17 20v-6h-2' }],
			['path', { d: 'M15 20h4' }]
		],
		aliases: ['arrow-down-01']
	};
</script>

<Icon {...props} icon={iconData} />
