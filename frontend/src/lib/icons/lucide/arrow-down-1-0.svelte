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
		name: 'arrow-down-1-0',
		size: 24,
		node: [
			['path', { d: 'm3 16 4 4 4-4' }],
			['path', { d: 'M7 20V4' }],
			['path', { d: 'M17 10V4h-2' }],
			['path', { d: 'M15 10h4' }],
			['rect', { x: '15', y: '14', width: '4', height: '6', ry: '2' }]
		],
		aliases: ['arrow-down-10']
	};
</script>

<Icon {...props} icon={iconData} />
