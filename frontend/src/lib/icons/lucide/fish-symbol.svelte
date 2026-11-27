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
		name: 'fish-symbol',
		size: 24,
		node: [
			['path', { d: 'M2 16s9-15 20-4C11 23 2 8 2 8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
