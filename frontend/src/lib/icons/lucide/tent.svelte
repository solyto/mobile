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
		name: 'tent',
		size: 24,
		node: [
			['path', { d: 'M3.5 21 14 3' }],
			['path', { d: 'M20.5 21 10 3' }],
			['path', { d: 'M15.5 21 12 15l-3.5 6' }],
			['path', { d: 'M2 21h20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
