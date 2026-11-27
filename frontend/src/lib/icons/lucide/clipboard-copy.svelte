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
		name: 'clipboard-copy',
		size: 24,
		node: [
			['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1' }],
			['path', { d: 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2' }],
			['path', { d: 'M16 4h2a2 2 0 0 1 2 2v4' }],
			['path', { d: 'M21 14H11' }],
			['path', { d: 'm15 10-4 4 4 4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
