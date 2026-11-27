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
		name: 'drafting-compass',
		size: 24,
		node: [
			['path', { d: 'm12.99 6.74 1.93 3.44' }],
			['path', { d: 'M19.136 12a10 10 0 0 1-14.271 0' }],
			['path', { d: 'm21 21-2.16-3.84' }],
			['path', { d: 'm3 21 8.02-14.26' }],
			['circle', { cx: '12', cy: '5', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
