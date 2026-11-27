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
		name: 'clipboard-clock',
		size: 24,
		node: [
			['path', { d: 'M16 14v2.2l1.6 1' }],
			['path', { d: 'M16 4h2a2 2 0 0 1 2 2v.832' }],
			['path', { d: 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2' }],
			['circle', { cx: '16', cy: '16', r: '6' }],
			['rect', { x: '8', y: '2', width: '8', height: '4', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
