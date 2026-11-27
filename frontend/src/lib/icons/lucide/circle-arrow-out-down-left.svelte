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
		name: 'circle-arrow-out-down-left',
		size: 24,
		node: [
			['path', { d: 'M2 12a10 10 0 1 1 10 10' }],
			['path', { d: 'm2 22 10-10' }],
			['path', { d: 'M8 22H2v-6' }]
		],
		aliases: ['arrow-down-left-from-circle']
	};
</script>

<Icon {...props} icon={iconData} />
