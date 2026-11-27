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
		name: 'clipboard-paste',
		size: 24,
		node: [
			['path', { d: 'M11 14h10' }],
			['path', { d: 'M16 4h2a2 2 0 0 1 2 2v1.344' }],
			['path', { d: 'm17 18 4-4-4-4' }],
			['path', { d: 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113' }],
			['rect', { x: '8', y: '2', width: '8', height: '4', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
