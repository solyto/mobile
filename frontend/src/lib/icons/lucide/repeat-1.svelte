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
		name: 'repeat-1',
		size: 24,
		node: [
			['path', { d: 'm17 2 4 4-4 4' }],
			['path', { d: 'M3 11v-1a4 4 0 0 1 4-4h14' }],
			['path', { d: 'm7 22-4-4 4-4' }],
			['path', { d: 'M21 13v1a4 4 0 0 1-4 4H3' }],
			['path', { d: 'M11 10h1v4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
