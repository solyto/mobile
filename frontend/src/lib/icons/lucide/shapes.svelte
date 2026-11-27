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
		name: 'shapes',
		size: 24,
		node: [
			['path', { d: 'M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z' }],
			['rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }],
			['circle', { cx: '17.5', cy: '17.5', r: '3.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
