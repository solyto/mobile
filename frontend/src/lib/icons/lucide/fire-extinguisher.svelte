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
		name: 'fire-extinguisher',
		size: 24,
		node: [
			['path', { d: 'M15 6.5V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3.5' }],
			['path', { d: 'M9 18h8' }],
			['path', { d: 'M18 3h-3' }],
			['path', { d: 'M11 3a6 6 0 0 0-6 6v11' }],
			['path', { d: 'M5 13h4' }],
			['path', { d: 'M17 10a4 4 0 0 0-8 0v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2Z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
