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
		name: 'square-centerline-dashed-vertical',
		size: 24,
		node: [
			['path', { d: 'M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3' }],
			['path', { d: 'M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3' }],
			['path', { d: 'M4 12H2' }],
			['path', { d: 'M10 12H8' }],
			['path', { d: 'M16 12h-2' }],
			['path', { d: 'M22 12h-2' }]
		],
		aliases: ['flip-vertical']
	};
</script>

<Icon {...props} icon={iconData} />
