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
		name: 'trending-up-down',
		size: 24,
		node: [
			['path', { d: 'M14.828 14.828 21 21' }],
			['path', { d: 'M21 16v5h-5' }],
			['path', { d: 'm21 3-9 9-4-4-6 6' }],
			['path', { d: 'M21 8V3h-5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
