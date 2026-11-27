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
		name: 'square-arrow-up-right',
		size: 24,
		node: [
			['path', { d: 'M15 15V9H9' }],
			['path', { d: 'm9 15 6-6' }],
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }]
		],
		aliases: ['arrow-up-right-square']
	};
</script>

<Icon {...props} icon={iconData} />
