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
		name: 'cast',
		size: 24,
		node: [
			['path', { d: 'M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6' }],
			['path', { d: 'M2 12a9 9 0 0 1 8 8' }],
			['path', { d: 'M2 16a5 5 0 0 1 4 4' }],
			['line', { x1: '2', x2: '2.01', y1: '20', y2: '20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
