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
		name: 'user-group',
		size: 24,
		node: [
			['path', { d: 'M17 21v-1a2 2 0 00-2-2H9a2 2 0 00-2 2v1' }],
			['path', { d: 'M19 10h1a2 2 0 012 2v1' }],
			['path', { d: 'M5 10H4a2 2 0 00-2 2v1' }],
			['circle', { cx: '12', cy: '11', r: '3' }],
			['circle', { cx: '18', cy: '4', r: '2' }],
			['circle', { cx: '6', cy: '4', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
