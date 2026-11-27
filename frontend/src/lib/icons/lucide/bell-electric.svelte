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
		name: 'bell-electric',
		size: 24,
		node: [
			['path', { d: 'M18.518 17.347A7 7 0 0 1 14 19' }],
			['path', { d: 'M18.8 4A11 11 0 0 1 20 9' }],
			['path', { d: 'M9 9h.01' }],
			['circle', { cx: '20', cy: '16', r: '2' }],
			['circle', { cx: '9', cy: '9', r: '7' }],
			['rect', { x: '4', y: '16', width: '10', height: '6', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
