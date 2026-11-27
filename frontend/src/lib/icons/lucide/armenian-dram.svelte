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
		name: 'armenian-dram',
		size: 24,
		node: [
			['path', { d: 'M11 10h8' }],
			['path', { d: 'M11 14h8' }],
			['path', { d: 'M17 20V10a6 6 0 0 0-12 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
