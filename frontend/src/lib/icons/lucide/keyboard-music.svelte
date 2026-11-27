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
		name: 'keyboard-music',
		size: 24,
		node: [
			['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
			['path', { d: 'M6 8h4' }],
			['path', { d: 'M14 8h.01' }],
			['path', { d: 'M18 8h.01' }],
			['path', { d: 'M2 12h20' }],
			['path', { d: 'M6 12v4' }],
			['path', { d: 'M10 12v4' }],
			['path', { d: 'M14 12v4' }],
			['path', { d: 'M18 12v4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
