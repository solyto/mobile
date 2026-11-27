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
		name: 'chart-column-stacked',
		size: 24,
		node: [
			['path', { d: 'M11 13H7' }],
			['path', { d: 'M19 9h-4' }],
			['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
			['rect', { x: '15', y: '5', width: '4', height: '12', rx: '1' }],
			['rect', { x: '7', y: '8', width: '4', height: '9', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
