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
		name: 'file-cog',
		size: 24,
		node: [
			['path', { d: 'M15 8a1 1 0 0 1-1-1V2a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8z' }],
			['path', { d: 'M20 8v12a2 2 0 0 1-2 2h-4.182' }],
			['path', { d: 'm3.305 19.53.923-.382' }],
			['path', { d: 'M4 10.592V4a2 2 0 0 1 2-2h8' }],
			['path', { d: 'm4.228 16.852-.924-.383' }],
			['path', { d: 'm5.852 15.228-.383-.923' }],
			['path', { d: 'm5.852 20.772-.383.924' }],
			['path', { d: 'm8.148 15.228.383-.923' }],
			['path', { d: 'm8.53 21.696-.382-.924' }],
			['path', { d: 'm9.773 16.852.922-.383' }],
			['path', { d: 'm9.773 19.148.922.383' }],
			['circle', { cx: '7', cy: '18', r: '3' }]
		],
		aliases: ['file-cog-2']
	};
</script>

<Icon {...props} icon={iconData} />
