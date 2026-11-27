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
		name: 'database-search',
		size: 24,
		node: [
			['path', { d: 'M21 11.693V5' }],
			['path', { d: 'm22 22-1.875-1.875' }],
			['path', { d: 'M3 12a9 3 0 0 0 8.697 2.998' }],
			['path', { d: 'M3 5v14a9 3 0 0 0 9.28 2.999' }],
			['circle', { cx: '18', cy: '18', r: '3' }],
			['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
