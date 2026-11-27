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
		name: 'trending-up',
		size: 24,
		node: [
			['path', { d: 'M16 7h6v6' }],
			['path', { d: 'm22 7-8.5 8.5-5-5L2 17' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
