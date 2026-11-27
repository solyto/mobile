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
		name: 'microchip',
		size: 24,
		node: [
			['path', { d: 'M10 12h4' }],
			['path', { d: 'M10 17h4' }],
			['path', { d: 'M10 7h4' }],
			['path', { d: 'M18 12h2' }],
			['path', { d: 'M18 18h2' }],
			['path', { d: 'M18 6h2' }],
			['path', { d: 'M4 12h2' }],
			['path', { d: 'M4 18h2' }],
			['path', { d: 'M4 6h2' }],
			['rect', { x: '6', y: '2', width: '12', height: '20', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
