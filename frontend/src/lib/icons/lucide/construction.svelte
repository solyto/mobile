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
		name: 'construction',
		size: 24,
		node: [
			['rect', { x: '2', y: '6', width: '20', height: '8', rx: '1' }],
			['path', { d: 'M17 14v7' }],
			['path', { d: 'M7 14v7' }],
			['path', { d: 'M17 3v3' }],
			['path', { d: 'M7 3v3' }],
			['path', { d: 'M10 14 2.3 6.3' }],
			['path', { d: 'm14 6 7.7 7.7' }],
			['path', { d: 'm8 6 8 8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
