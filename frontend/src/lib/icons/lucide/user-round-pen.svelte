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
		name: 'user-round-pen',
		size: 24,
		node: [
			['path', { d: 'M2 21a8 8 0 0 1 10.821-7.487' }],
			['path', { d: 'M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z' }],
			['circle', { cx: '10', cy: '8', r: '5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
