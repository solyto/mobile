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
		name: 'cigarette',
		size: 24,
		node: [
			['path', { d: 'M17 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h14' }],
			['path', { d: 'M18 8c0-2.5-2-2.5-2-5' }],
			['path', { d: 'M21 16a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1' }],
			['path', { d: 'M22 8c0-2.5-2-2.5-2-5' }],
			['path', { d: 'M7 12v4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
