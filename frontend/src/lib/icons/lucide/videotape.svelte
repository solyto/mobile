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
		name: 'videotape',
		size: 24,
		node: [
			['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
			['path', { d: 'M2 8h20' }],
			['circle', { cx: '8', cy: '14', r: '2' }],
			['path', { d: 'M8 12h8' }],
			['circle', { cx: '16', cy: '14', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
