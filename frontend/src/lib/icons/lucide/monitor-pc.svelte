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
		name: 'monitor-pc',
		size: 24,
		node: [
			['path', { d: 'M10 15H4a2 2 0 01-2-2V7a2 2 0 012-2h6' }],
			['path', { d: 'M10 19H5' }],
			['path', { d: 'M14 11h8' }],
			['path', { d: 'M14 7h8' }],
			['path', { d: 'M18 17h.01' }],
			['path', { d: 'M9 19v-4' }],
			['rect', { x: '14', y: '3', width: '8', height: '18', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
