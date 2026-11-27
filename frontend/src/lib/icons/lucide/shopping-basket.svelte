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
		name: 'shopping-basket',
		size: 24,
		node: [
			['path', { d: 'm15 11-1 9' }],
			['path', { d: 'm19 11-4-7' }],
			['path', { d: 'M2 11h20' }],
			['path', { d: 'm3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4' }],
			['path', { d: 'M4.5 15.5h15' }],
			['path', { d: 'm5 11 4-7' }],
			['path', { d: 'm9 11 1 9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
