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
		name: 'square-pi',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
			['path', { d: 'M7 7h10' }],
			['path', { d: 'M10 7v10' }],
			['path', { d: 'M16 17a2 2 0 0 1-2-2V7' }]
		],
		aliases: ['pi-square']
	};
</script>

<Icon {...props} icon={iconData} />
