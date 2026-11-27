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
		name: 'laptop-minimal',
		size: 24,
		node: [
			['rect', { width: '18', height: '12', x: '3', y: '4', rx: '2', ry: '2' }],
			['line', { x1: '2', x2: '22', y1: '20', y2: '20' }]
		],
		aliases: ['laptop-2']
	};
</script>

<Icon {...props} icon={iconData} />
