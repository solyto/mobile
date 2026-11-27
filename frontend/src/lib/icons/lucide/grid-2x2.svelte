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
		name: 'grid-2x2',
		size: 24,
		node: [
			['path', { d: 'M12 3v18' }],
			['path', { d: 'M3 12h18' }],
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }]
		],
		aliases: ['grid-2-x-2']
	};
</script>

<Icon {...props} icon={iconData} />
