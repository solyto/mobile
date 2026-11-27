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
		name: 'chess-queen',
		size: 24,
		node: [
			['path', { d: 'm10.68 5.499-.996 4.982a.65.65 0 01-1.131.295L5.885 7.663' }],
			['path', { d: 'm13.32 5.5.995 4.98a.65.65 0 001.131.296l2.668-3.113' }],
			['path', { d: 'M20.428 8.952 17.5 18' }],
			['path', { d: 'M4 20a2 2 0 012-2h12a2 2 0 012 2v1a1 1 0 01-1 1H5a1 1 0 01-1-1z' }],
			['path', { d: 'M6.5 18 3.571 8.952' }],
			['circle', { cx: '12', cy: '4', r: '2' }],
			['circle', { cx: '20', cy: '7', r: '2' }],
			['circle', { cx: '4', cy: '7', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
