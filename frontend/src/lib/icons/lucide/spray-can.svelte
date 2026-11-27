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
		name: 'spray-can',
		size: 24,
		node: [
			['path', { d: 'M3 3h.01' }],
			['path', { d: 'M7 5h.01' }],
			['path', { d: 'M11 7h.01' }],
			['path', { d: 'M3 7h.01' }],
			['path', { d: 'M7 9h.01' }],
			['path', { d: 'M3 11h.01' }],
			['rect', { width: '4', height: '4', x: '15', y: '5' }],
			['path', { d: 'm19 9 2 2v10c0 .6-.4 1-1 1h-6c-.6 0-1-.4-1-1V11l2-2' }],
			['path', { d: 'm13 14 8-2' }],
			['path', { d: 'm13 19 8-2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
