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
		name: 'eject',
		size: 24,
		node: [
			['path', { d: 'M4 13a1 1 0 0 1-.72-1.695l7.257-7.668a2 2 0 0 1 2.926 0l7.256 7.668A1 1 0 0 1 20 13z' }],
			['rect', { x: '3', y: '17', width: '18', height: '4', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
