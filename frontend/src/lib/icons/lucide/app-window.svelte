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
		name: 'app-window',
		size: 24,
		node: [
			['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }],
			['path', { d: 'M10 4v4' }],
			['path', { d: 'M2 8h20' }],
			['path', { d: 'M6 4v4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
