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
		name: 'building',
		size: 24,
		node: [
			['path', { d: 'M12 10h.01' }],
			['path', { d: 'M12 14h.01' }],
			['path', { d: 'M12 6h.01' }],
			['path', { d: 'M16 10h.01' }],
			['path', { d: 'M16 14h.01' }],
			['path', { d: 'M16 6h.01' }],
			['path', { d: 'M8 10h.01' }],
			['path', { d: 'M8 14h.01' }],
			['path', { d: 'M8 6h.01' }],
			['path', { d: 'M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3' }],
			['rect', { x: '4', y: '2', width: '16', height: '20', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
