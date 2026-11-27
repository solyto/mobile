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
		name: 'navigation-off',
		size: 24,
		node: [
			['path', { d: 'M8.43 8.43 3 11l8 2 2 8 2.57-5.43' }],
			['path', { d: 'M17.39 11.73 22 2l-9.73 4.61' }],
			['line', { x1: '2', x2: '22', y1: '2', y2: '22' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
