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
		name: 'monitor-speaker',
		size: 24,
		node: [
			['path', { d: 'M5.5 20H8' }],
			['path', { d: 'M17 9h.01' }],
			['rect', { width: '10', height: '16', x: '12', y: '4', rx: '2' }],
			['path', { d: 'M8 6H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4' }],
			['circle', { cx: '17', cy: '15', r: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
