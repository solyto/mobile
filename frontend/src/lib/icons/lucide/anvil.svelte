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
		name: 'anvil',
		size: 24,
		node: [
			['path', { d: 'M7 10H6a4 4 0 0 1-4-4 1 1 0 0 1 1-1h4' }],
			['path', { d: 'M7 5a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1 7 7 0 0 1-7 7H8a1 1 0 0 1-1-1z' }],
			['path', { d: 'M9 12v5' }],
			['path', { d: 'M15 12v5' }],
			['path', { d: 'M5 20a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3 1 1 0 0 1-1 1H6a1 1 0 0 1-1-1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
