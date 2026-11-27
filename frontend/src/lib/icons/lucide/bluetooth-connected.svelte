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
		name: 'bluetooth-connected',
		size: 24,
		node: [
			['path', { d: 'm7 7 10 10-5 5V2l5 5L7 17' }],
			['line', { x1: '18', x2: '21', y1: '12', y2: '12' }],
			['line', { x1: '3', x2: '6', y1: '12', y2: '12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
