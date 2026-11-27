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
		name: 'panel-bottom-dashed',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
			['path', { d: 'M14 15h1' }],
			['path', { d: 'M19 15h2' }],
			['path', { d: 'M3 15h2' }],
			['path', { d: 'M9 15h1' }]
		],
		aliases: ['panel-bottom-inactive']
	};
</script>

<Icon {...props} icon={iconData} />
