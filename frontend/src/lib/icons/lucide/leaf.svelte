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
		name: 'leaf',
		size: 24,
		node: [
			['path', { d: 'M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20' }],
			['path', { d: 'M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
