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
		name: 'battery',
		size: 24,
		node: [
			['path', { d: 'M 22 14 L 22 10' }],
			['rect', { x: '2', y: '6', width: '16', height: '12', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
