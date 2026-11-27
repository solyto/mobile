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
		name: 'square-arrow-down-left',
		size: 24,
		node: [
			['path', { d: 'M15 15H9l6-6' }],
			['path', { d: 'M9 15V9' }],
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }]
		],
		aliases: ['arrow-down-left-square']
	};
</script>

<Icon {...props} icon={iconData} />
