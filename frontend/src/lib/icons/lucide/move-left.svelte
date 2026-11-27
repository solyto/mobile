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
		name: 'move-left',
		size: 24,
		node: [
			['path', { d: 'M6 8L2 12L6 16' }],
			['path', { d: 'M2 12H22' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
