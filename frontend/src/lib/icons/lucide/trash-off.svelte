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
		name: 'trash-off',
		size: 24,
		node: [
			['path', { d: 'M10 11v6' }],
			['path', { d: 'M14 17v-3' }],
			['path', { d: 'M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-1.576.768' }],
			['path', { d: 'M19 6v7.344' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M21 6h-9.344' }],
			['path', { d: 'M3 6h3' }],
			['path', { d: 'M5 6v14a2 2 0 002 2h10a2 2 0 002-2v-1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
