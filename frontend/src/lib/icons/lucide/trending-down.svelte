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
		name: 'trending-down',
		size: 24,
		node: [
			['path', { d: 'M16 17h6v-6' }],
			['path', { d: 'm22 17-8.5-8.5-5 5L2 7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
