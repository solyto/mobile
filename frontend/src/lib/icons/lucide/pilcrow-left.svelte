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
		name: 'pilcrow-left',
		size: 24,
		node: [
			['path', { d: 'M14 3v11' }],
			['path', { d: 'M14 9h-3a3 3 0 0 1 0-6h9' }],
			['path', { d: 'M18 3v11' }],
			['path', { d: 'M22 18H2l4-4' }],
			['path', { d: 'm6 22-4-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
