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
		name: 'briefcase-conveyor-belt',
		size: 24,
		node: [
			['path', { d: 'M10 20v2' }],
			['path', { d: 'M14 20v2' }],
			['path', { d: 'M18 20v2' }],
			['path', { d: 'M21 20H3' }],
			['path', { d: 'M6 20v2' }],
			['path', { d: 'M8 16V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12' }],
			['rect', { x: '4', y: '6', width: '16', height: '10', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
