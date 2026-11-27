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
		name: 'navigation-2-off',
		size: 24,
		node: [
			['path', { d: 'M9.31 9.31 5 21l7-4 7 4-1.17-3.17' }],
			['path', { d: 'M14.53 8.88 12 2l-1.17 3.17' }],
			['line', { x1: '2', x2: '22', y1: '2', y2: '22' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
