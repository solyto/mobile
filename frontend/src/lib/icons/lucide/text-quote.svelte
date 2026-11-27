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
		name: 'text-quote',
		size: 24,
		node: [
			['path', { d: 'M17 5H3' }],
			['path', { d: 'M21 12H8' }],
			['path', { d: 'M21 19H8' }],
			['path', { d: 'M3 12v7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
