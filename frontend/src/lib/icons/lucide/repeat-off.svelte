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
		name: 'repeat-off',
		size: 24,
		node: [
			['path', { d: 'M11.656 6H21l-4-4' }],
			['path', { d: 'M17.898 17.898A4 4 0 0 1 17 18H3l4-4' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M21 13v1a4 4 0 0 1-.171 1.159' }],
			['path', { d: 'm21 6-4 4' }],
			['path', { d: 'M3 11v-1a4 4 0 0 1 3.102-3.898' }],
			['path', { d: 'm7 22-4-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
