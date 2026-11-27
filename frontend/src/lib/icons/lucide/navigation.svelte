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
		name: 'navigation',
		size: 24,
		node: [
			['polygon', { points: '3 11 22 2 13 21 11 13 3 11' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
