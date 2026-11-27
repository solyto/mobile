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
		name: 'square-arrow-right-exit',
		size: 24,
		node: [
			['path', { d: 'M10 12h11' }],
			['path', { d: 'm17 16 4-4-4-4' }],
			['path', { d: 'M21 6.344V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.344' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
