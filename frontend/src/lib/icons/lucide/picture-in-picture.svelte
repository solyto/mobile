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
		name: 'picture-in-picture',
		size: 24,
		node: [
			['path', { d: 'M2 10h6V4' }],
			['path', { d: 'm2 4 6 6' }],
			['path', { d: 'M21 10V7a2 2 0 0 0-2-2h-7' }],
			['path', { d: 'M3 14v2a2 2 0 0 0 2 2h3' }],
			['rect', { x: '12', y: '14', width: '10', height: '7', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
