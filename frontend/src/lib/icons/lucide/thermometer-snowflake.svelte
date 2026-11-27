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
		name: 'thermometer-snowflake',
		size: 24,
		node: [
			['path', { d: 'm10 20-1.25-2.5L6 18' }],
			['path', { d: 'M10 4 8.75 6.5 6 6' }],
			['path', { d: 'M10.585 15H10' }],
			['path', { d: 'M2 12h6.5L10 9' }],
			['path', { d: 'M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z' }],
			['path', { d: 'm4 10 1.5 2L4 14' }],
			['path', { d: 'm7 21 3-6-1.5-3' }],
			['path', { d: 'm7 3 3 6h2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
