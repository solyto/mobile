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
		name: 'turntable',
		size: 24,
		node: [
			['path', { d: 'M10 12.01h.01' }],
			['path', { d: 'M18 8v4a8 8 0 0 1-1.07 4' }],
			['circle', { cx: '10', cy: '12', r: '4' }],
			['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
