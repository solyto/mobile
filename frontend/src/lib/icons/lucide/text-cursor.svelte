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
		name: 'text-cursor',
		size: 24,
		node: [
			['path', { d: 'M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1' }],
			['path', { d: 'M7 22h1a4 4 0 0 0 4-4' }],
			['path', { d: 'M7 2h1a4 4 0 0 1 4 4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
