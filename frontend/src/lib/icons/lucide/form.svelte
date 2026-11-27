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
		name: 'form',
		size: 24,
		node: [
			['path', { d: 'M4 14h6' }],
			['path', { d: 'M4 2h10' }],
			['rect', { x: '4', y: '18', width: '16', height: '4', rx: '1' }],
			['rect', { x: '4', y: '6', width: '16', height: '4', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
