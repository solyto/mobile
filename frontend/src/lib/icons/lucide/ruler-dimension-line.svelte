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
		name: 'ruler-dimension-line',
		size: 24,
		node: [
			['path', { d: 'M10 15v-3' }],
			['path', { d: 'M14 15v-3' }],
			['path', { d: 'M18 15v-3' }],
			['path', { d: 'M2 8V4' }],
			['path', { d: 'M22 6H2' }],
			['path', { d: 'M22 8V4' }],
			['path', { d: 'M6 15v-3' }],
			['rect', { x: '2', y: '12', width: '20', height: '8', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
