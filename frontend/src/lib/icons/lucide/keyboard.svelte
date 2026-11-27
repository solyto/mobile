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
		name: 'keyboard',
		size: 24,
		node: [
			['path', { d: 'M10 8h.01' }],
			['path', { d: 'M12 12h.01' }],
			['path', { d: 'M14 8h.01' }],
			['path', { d: 'M16 12h.01' }],
			['path', { d: 'M18 8h.01' }],
			['path', { d: 'M6 8h.01' }],
			['path', { d: 'M7 16h10' }],
			['path', { d: 'M8 12h.01' }],
			['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
