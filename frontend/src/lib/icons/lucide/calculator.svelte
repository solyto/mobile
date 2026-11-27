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
		name: 'calculator',
		size: 24,
		node: [
			['rect', { width: '16', height: '20', x: '4', y: '2', rx: '2' }],
			['line', { x1: '8', x2: '16', y1: '6', y2: '6' }],
			['line', { x1: '16', x2: '16', y1: '14', y2: '18' }],
			['path', { d: 'M16 10h.01' }],
			['path', { d: 'M12 10h.01' }],
			['path', { d: 'M8 10h.01' }],
			['path', { d: 'M12 14h.01' }],
			['path', { d: 'M8 14h.01' }],
			['path', { d: 'M12 18h.01' }],
			['path', { d: 'M8 18h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
