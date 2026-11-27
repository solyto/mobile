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
		name: 'square-scissors',
		size: 24,
		node: [
			['path', { d: 'm17 17-2.18-2.18' }],
			['path', { d: 'M9.56 14.44 17 7' }],
			['path', { d: 'M9.56 9.56 12 12' }],
			['circle', { cx: '8.5', cy: '15.5', r: '1.5' }],
			['circle', { cx: '8.5', cy: '8.5', r: '1.5' }],
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }]
		],
		aliases: ['scissors-square']
	};
</script>

<Icon {...props} icon={iconData} />
