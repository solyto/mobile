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
		name: 'circuit-board',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
			['path', { d: 'M11 9h4a2 2 0 0 0 2-2V3' }],
			['circle', { cx: '9', cy: '9', r: '2' }],
			['path', { d: 'M7 21v-4a2 2 0 0 1 2-2h4' }],
			['circle', { cx: '15', cy: '15', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
