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
		name: 'navigation-2',
		size: 24,
		node: [
			['polygon', { points: '12 2 19 21 12 17 5 21 12 2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
