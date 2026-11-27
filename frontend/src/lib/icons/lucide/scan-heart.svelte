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
		name: 'scan-heart',
		size: 24,
		node: [
			['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
			['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
			['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
			['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
			['path', { d: 'M7.828 13.07A3 3 0 0 1 12 8.764a3 3 0 0 1 4.172 4.306l-3.447 3.62a1 1 0 0 1-1.449 0z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
