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
		name: 'car-battery',
		size: 24,
		node: [
			['path', { d: 'M14 13h4' }],
			['path', { d: 'M16 15v-4' }],
			['path', { d: 'M18 5v2' }],
			['path', { d: 'M6 13h4' }],
			['path', { d: 'M6 5v2' }],
			['rect', { x: '2', y: '7', width: '20', height: '12', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
