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
		name: 'cup-soda',
		size: 24,
		node: [
			['path', { d: 'm6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8' }],
			['path', { d: 'M5 8h14' }],
			['path', { d: 'M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0' }],
			['path', { d: 'm12 8 1-6h2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
