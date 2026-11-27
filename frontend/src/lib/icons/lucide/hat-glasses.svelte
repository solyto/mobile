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
		name: 'hat-glasses',
		size: 24,
		node: [
			['path', { d: 'M14 18a2 2 0 0 0-4 0' }],
			['path', { d: 'm19 11-2.11-6.657a2 2 0 0 0-2.752-1.148l-1.276.61A2 2 0 0 1 12 4H8.5a2 2 0 0 0-1.925 1.456L5 11' }],
			['path', { d: 'M2 11h20' }],
			['circle', { cx: '17', cy: '18', r: '3' }],
			['circle', { cx: '7', cy: '18', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
