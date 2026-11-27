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
		name: 'copy-x',
		size: 24,
		node: [
			['path', { d: 'M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2' }],
			['rect', { x: '8', y: '8', width: '14', height: '14', rx: '2' }],
			['path', { d: 'm12.5 12.5 5 5' }],
			['path', { d: 'm12.5 17.5 5-5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
