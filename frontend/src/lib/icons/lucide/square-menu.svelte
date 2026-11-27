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
		name: 'square-menu',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
			['path', { d: 'M7 8h10' }],
			['path', { d: 'M7 12h10' }],
			['path', { d: 'M7 16h10' }]
		],
		aliases: ['menu-square']
	};
</script>

<Icon {...props} icon={iconData} />
