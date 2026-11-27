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
		name: 'tube-lotion',
		size: 24,
		node: [
			['path', { d: 'M15 18v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3' }],
			['path', { d: 'M17 2a2 2 0 0 1 1.6 3.2A8 8 0 0 0 17 10v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6a8 8 0 0 0-1.6-4.8A2 2 0 0 1 7 2z' }],
			['path', { d: 'M7 10a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
