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
		name: 'door-closed-package',
		size: 24,
		node: [
			['path', { d: 'M18 13v3' }],
			['path', { d: 'M19 9V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' }],
			['path', { d: 'M2 21h8' }],
			['path', { d: 'M9 12h.01' }],
			['rect', { x: '14', y: '13', width: '8', height: '8', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
