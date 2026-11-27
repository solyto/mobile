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
		name: 'move-right',
		size: 24,
		node: [
			['path', { d: 'M18 8L22 12L18 16' }],
			['path', { d: 'M2 12H22' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
