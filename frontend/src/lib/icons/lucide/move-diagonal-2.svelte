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
		name: 'move-diagonal-2',
		size: 24,
		node: [
			['path', { d: 'M19 13v6h-6' }],
			['path', { d: 'M5 11V5h6' }],
			['path', { d: 'm5 5 14 14' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
