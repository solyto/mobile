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
		name: 'images',
		size: 24,
		node: [
			['path', { d: 'm22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16' }],
			['path', { d: 'M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2' }],
			['circle', { cx: '13', cy: '7', r: '1', fill: 'currentColor' }],
			['rect', { x: '8', y: '2', width: '14', height: '14', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
