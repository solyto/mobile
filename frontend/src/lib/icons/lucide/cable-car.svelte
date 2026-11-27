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
		name: 'cable-car',
		size: 24,
		node: [
			['path', { d: 'M10 3h.01' }],
			['path', { d: 'M14 2h.01' }],
			['path', { d: 'm2 9 20-5' }],
			['path', { d: 'M12 12V6.5' }],
			['rect', { width: '16', height: '10', x: '4', y: '12', rx: '3' }],
			['path', { d: 'M9 12v5' }],
			['path', { d: 'M15 12v5' }],
			['path', { d: 'M4 17h16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
