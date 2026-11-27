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
		name: 'wand-sparkles',
		size: 24,
		node: [
			['path', { d: 'm21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72' }],
			['path', { d: 'm14 7 3 3' }],
			['path', { d: 'M5 6v4' }],
			['path', { d: 'M19 14v4' }],
			['path', { d: 'M10 2v2' }],
			['path', { d: 'M7 8H3' }],
			['path', { d: 'M21 16h-4' }],
			['path', { d: 'M11 3H9' }]
		],
		aliases: ['wand-2']
	};
</script>

<Icon {...props} icon={iconData} />
