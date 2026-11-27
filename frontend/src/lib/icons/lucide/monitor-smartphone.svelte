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
		name: 'monitor-smartphone',
		size: 24,
		node: [
			['path', { d: 'M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8' }],
			['path', { d: 'M10 19v-3.96 3.15' }],
			['path', { d: 'M7 19h5' }],
			['rect', { width: '6', height: '10', x: '16', y: '12', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
