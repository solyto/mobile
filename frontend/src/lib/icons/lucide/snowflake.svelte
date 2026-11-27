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
		name: 'snowflake',
		size: 24,
		node: [
			['path', { d: 'm10 20-1.25-2.5L6 18' }],
			['path', { d: 'M10 4 8.75 6.5 6 6' }],
			['path', { d: 'm14 20 1.25-2.5L18 18' }],
			['path', { d: 'm14 4 1.25 2.5L18 6' }],
			['path', { d: 'm17 21-3-6h-4' }],
			['path', { d: 'm17 3-3 6 1.5 3' }],
			['path', { d: 'M2 12h6.5L10 9' }],
			['path', { d: 'm20 10-1.5 2 1.5 2' }],
			['path', { d: 'M22 12h-6.5L14 15' }],
			['path', { d: 'm4 10 1.5 2L4 14' }],
			['path', { d: 'm7 21 3-6-1.5-3' }],
			['path', { d: 'm7 3 3 6h4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
