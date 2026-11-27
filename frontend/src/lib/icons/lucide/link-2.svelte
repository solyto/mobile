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
		name: 'link-2',
		size: 24,
		node: [
			['path', { d: 'M9 17H7A5 5 0 0 1 7 7h2' }],
			['path', { d: 'M15 7h2a5 5 0 1 1 0 10h-2' }],
			['line', { x1: '8', x2: '16', y1: '12', y2: '12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
