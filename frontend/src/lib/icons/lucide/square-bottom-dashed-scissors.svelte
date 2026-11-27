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
		name: 'square-bottom-dashed-scissors',
		size: 24,
		node: [
			['path', { d: 'M14 21h1' }],
			['path', { d: 'm17 17-2.18-2.18' }],
			['path', { d: 'M5 21a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2' }],
			['path', { d: 'M9 21h1' }],
			['path', { d: 'M9.56 14.44 17 7' }],
			['path', { d: 'M9.56 9.56 12 12' }],
			['circle', { cx: '8.5', cy: '15.5', r: '1.5' }],
			['circle', { cx: '8.5', cy: '8.5', r: '1.5' }]
		],
		aliases: ['scissors-square-dashed-bottom']
	};
</script>

<Icon {...props} icon={iconData} />
