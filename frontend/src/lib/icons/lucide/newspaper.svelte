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
		name: 'newspaper',
		size: 24,
		node: [
			['path', { d: 'M15 18h-5' }],
			['path', { d: 'M18 14h-8' }],
			['path', { d: 'M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2' }],
			['rect', { width: '8', height: '4', x: '10', y: '6', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
