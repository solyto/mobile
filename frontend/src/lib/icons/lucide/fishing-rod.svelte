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
		name: 'fishing-rod',
		size: 24,
		node: [
			['path', { d: 'M4 11h1' }],
			['path', { d: 'M8 15a2 2 0 0 1-4 0V3a1 1 0 0 1 1-1h.5C14 2 20 9 20 18v4' }],
			['circle', { cx: '18', cy: '18', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
