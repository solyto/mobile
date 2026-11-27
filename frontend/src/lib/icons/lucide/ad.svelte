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
		name: 'ad',
		size: 24,
		node: [
			['path', { d: 'M10 13H6' }],
			['path', { d: 'M10 15v-4a2 2 0 0 0-4 0v4' }],
			['path', { d: 'M14 14.5a.5.5 0 0 0 .5.5h1a2.5 2.5 0 0 0 2.5-2.5v-1A2.5 2.5 0 0 0 15.5 9h-1a.5.5 0 0 0-.5.5z' }],
			['rect', { x: '2', y: '5', width: '20', height: '14', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
