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
		name: 'lock-keyhole',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '16', r: '1' }],
			['rect', { x: '3', y: '10', width: '18', height: '12', rx: '2' }],
			['path', { d: 'M7 10V7a5 5 0 0 1 10 0v3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
