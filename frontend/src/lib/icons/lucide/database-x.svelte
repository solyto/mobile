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
		name: 'database-x',
		size: 24,
		node: [
			['path', { d: 'm17 17 5 5' }],
			['path', { d: 'M19.323 13.744A9 3 0 0 0 21 12' }],
			['path', { d: 'M21 13.127V5' }],
			['path', { d: 'm22 17-5 5' }],
			['path', { d: 'M3 12A9 3 0 0 0 13.563 14.954' }],
			['path', { d: 'M3 5V19A9 3 0 0 0 13 21.981' }],
			['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
