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
		name: 'toolbox',
		size: 24,
		node: [
			['path', { d: 'M16 12v4' }],
			['path', { d: 'M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2' }],
			['path', { d: 'M17 6a2 2 0 011.414.586l3 3A2 2 0 0122 11v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8a2 2 0 01.586-1.414l3-3A2 2 0 017 6z' }],
			['path', { d: 'M2 14h20' }],
			['path', { d: 'M8 12v4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
