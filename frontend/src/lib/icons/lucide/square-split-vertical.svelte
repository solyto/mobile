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
		name: 'square-split-vertical',
		size: 24,
		node: [
			['path', { d: 'M2 12h20' }],
			['path', { d: 'M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3' }],
			['path', { d: 'M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3' }]
		],
		aliases: ['split-square-vertical']
	};
</script>

<Icon {...props} icon={iconData} />
