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
		name: 'chart-bar-stacked',
		size: 24,
		node: [
			['path', { d: 'M11 13v4' }],
			['path', { d: 'M15 5v4' }],
			['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
			['rect', { x: '7', y: '13', width: '9', height: '4', rx: '1' }],
			['rect', { x: '7', y: '5', width: '12', height: '4', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
