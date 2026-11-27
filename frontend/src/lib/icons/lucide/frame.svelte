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
		name: 'frame',
		size: 24,
		node: [
			['line', { x1: '22', x2: '2', y1: '6', y2: '6' }],
			['line', { x1: '22', x2: '2', y1: '18', y2: '18' }],
			['line', { x1: '6', x2: '6', y1: '2', y2: '22' }],
			['line', { x1: '18', x2: '18', y1: '2', y2: '22' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
