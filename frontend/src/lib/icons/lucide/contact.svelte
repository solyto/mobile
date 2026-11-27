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
		name: 'contact',
		size: 24,
		node: [
			['path', { d: 'M16 2v2' }],
			['path', { d: 'M7 21v-2a2 2 0 012-2h6a2 2 0 012 2v2' }],
			['path', { d: 'M8 2v2' }],
			['circle', { cx: '12', cy: '10', r: '3' }],
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
