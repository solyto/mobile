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
		name: 'computer',
		size: 24,
		node: [
			['path', { d: 'M12 18h6' }],
			['path', { d: 'M6 18h.01' }],
			['path', { d: 'M8 6h1' }],
			['rect', { x: '2', y: '14', width: '20', height: '8', rx: '2' }],
			['rect', { x: '4', y: '2', width: '16', height: '12', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
