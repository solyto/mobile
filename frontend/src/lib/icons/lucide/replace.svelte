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
		name: 'replace',
		size: 24,
		node: [
			['path', { d: 'M14 4a1 1 0 0 1 1-1' }],
			['path', { d: 'M15 10a1 1 0 0 1-1-1' }],
			['path', { d: 'M21 4a1 1 0 0 0-1-1' }],
			['path', { d: 'M21 9a1 1 0 0 1-1 1' }],
			['path', { d: 'm3 7 3 3 3-3' }],
			['path', { d: 'M6 10V5a2 2 0 0 1 2-2h2' }],
			['rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
