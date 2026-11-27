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
		name: 'laptop-minimal-check',
		size: 24,
		node: [
			['path', { d: 'M2 20h20' }],
			['path', { d: 'm9 10 2 2 4-4' }],
			['rect', { x: '3', y: '4', width: '18', height: '12', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
