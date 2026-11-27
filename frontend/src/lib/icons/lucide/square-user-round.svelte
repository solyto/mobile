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
		name: 'square-user-round',
		size: 24,
		node: [
			['path', { d: 'M18 21a6 6 0 0 0-12 0' }],
			['circle', { cx: '12', cy: '11', r: '4' }],
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }]
		],
		aliases: ['user-square-2']
	};
</script>

<Icon {...props} icon={iconData} />
