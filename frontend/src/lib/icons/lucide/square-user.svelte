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
		name: 'square-user',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
			['circle', { cx: '12', cy: '10', r: '3' }],
			['path', { d: 'M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2' }]
		],
		aliases: ['user-square']
	};
</script>

<Icon {...props} icon={iconData} />
