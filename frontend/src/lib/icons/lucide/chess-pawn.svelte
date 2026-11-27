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
		name: 'chess-pawn',
		size: 24,
		node: [
			['path', { d: 'M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z' }],
			['path', { d: 'm14.5 10 1.5 8' }],
			['path', { d: 'M7 10h10' }],
			['path', { d: 'm8 18 1.5-8' }],
			['circle', { cx: '12', cy: '6', r: '4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
