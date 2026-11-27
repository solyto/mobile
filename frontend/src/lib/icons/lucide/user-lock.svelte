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
		name: 'user-lock',
		size: 24,
		node: [
			['path', { d: 'M19 16v-2a2 2 0 0 0-4 0v2' }],
			['path', { d: 'M9.5 15H7a4 4 0 0 0-4 4v2' }],
			['circle', { cx: '10', cy: '7', r: '4' }],
			['rect', { x: '13', y: '16', width: '8', height: '5', rx: '.899' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
