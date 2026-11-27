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
		name: 'layout-panel-left',
		size: 24,
		node: [
			['rect', { width: '7', height: '18', x: '3', y: '3', rx: '1' }],
			['rect', { width: '7', height: '7', x: '14', y: '3', rx: '1' }],
			['rect', { width: '7', height: '7', x: '14', y: '14', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
