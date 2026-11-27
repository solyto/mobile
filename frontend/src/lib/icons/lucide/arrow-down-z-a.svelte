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
		name: 'arrow-down-z-a',
		size: 24,
		node: [
			['path', { d: 'm3 16 4 4 4-4' }],
			['path', { d: 'M7 4v16' }],
			['path', { d: 'M15 4h5l-5 6h5' }],
			['path', { d: 'M15 20v-3.5a2.5 2.5 0 0 1 5 0V20' }],
			['path', { d: 'M20 18h-5' }]
		],
		aliases: ['arrow-down-za']
	};
</script>

<Icon {...props} icon={iconData} />
