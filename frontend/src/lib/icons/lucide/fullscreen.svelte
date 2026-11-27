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
		name: 'fullscreen',
		size: 24,
		node: [
			['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
			['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
			['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
			['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
			['rect', { width: '10', height: '8', x: '7', y: '8', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
