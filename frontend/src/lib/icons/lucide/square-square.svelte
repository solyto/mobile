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
		name: 'square-square',
		size: 24,
		node: [
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
			['rect', { x: '8', y: '8', width: '8', height: '8', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
