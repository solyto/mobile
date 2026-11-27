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
		name: 'map-pin-check',
		size: 24,
		node: [
			['path', { d: 'M19.43 12.935c.357-.967.57-1.955.57-2.935a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32.197 32.197 0 0 0 .813-.728' }],
			['circle', { cx: '12', cy: '10', r: '3' }],
			['path', { d: 'm16 18 2 2 4-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
