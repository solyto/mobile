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
		name: 'maximize',
		size: 24,
		node: [
			['path', { d: 'M8 3H5a2 2 0 0 0-2 2v3' }],
			['path', { d: 'M21 8V5a2 2 0 0 0-2-2h-3' }],
			['path', { d: 'M3 16v3a2 2 0 0 0 2 2h3' }],
			['path', { d: 'M16 21h3a2 2 0 0 0 2-2v-3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
