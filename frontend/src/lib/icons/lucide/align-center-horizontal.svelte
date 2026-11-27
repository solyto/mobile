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
		name: 'align-center-horizontal',
		size: 24,
		node: [
			['path', { d: 'M2 12h20' }],
			['path', { d: 'M10 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4' }],
			['path', { d: 'M10 8V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4' }],
			['path', { d: 'M20 16v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1' }],
			['path', { d: 'M14 8V7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
