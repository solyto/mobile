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
		name: 'refrigerator',
		size: 24,
		node: [
			['path', { d: 'M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z' }],
			['path', { d: 'M5 10h14' }],
			['path', { d: 'M15 7v6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
