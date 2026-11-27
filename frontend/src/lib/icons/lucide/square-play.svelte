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
		name: 'square-play',
		size: 24,
		node: [
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
			['path', { d: 'M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z' }]
		],
		aliases: ['play-square']
	};
</script>

<Icon {...props} icon={iconData} />
