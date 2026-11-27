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
		name: 'user-round-search',
		size: 24,
		node: [
			['circle', { cx: '10', cy: '8', r: '5' }],
			['path', { d: 'M2 21a8 8 0 0 1 10.434-7.62' }],
			['circle', { cx: '18', cy: '18', r: '3' }],
			['path', { d: 'm22 22-1.9-1.9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
