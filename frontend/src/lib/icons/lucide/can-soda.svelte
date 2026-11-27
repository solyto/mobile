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
		name: 'can-soda',
		size: 24,
		node: [
			['path', { d: 'm17 22 1.664-2.496a2 2 0 00.336-1.11V5.606a2 2 0 00-.336-1.11L17 2' }],
			['path', { d: 'M18 22H6' }],
			['path', { d: 'M18 2H6' }],
			['path', { d: 'M5 17h14' }],
			['path', { d: 'M5 7h14' }],
			['path', { d: 'm7 22-1.664-2.496A2 2 0 015 18.394V5.606a2 2 0 01.336-1.11L7 2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
