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
		name: 'user-plus',
		size: 24,
		node: [
			['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
			['circle', { cx: '9', cy: '7', r: '4' }],
			['line', { x1: '19', x2: '19', y1: '8', y2: '14' }],
			['line', { x1: '22', x2: '16', y1: '11', y2: '11' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
