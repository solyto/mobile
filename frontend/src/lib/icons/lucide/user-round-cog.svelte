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
		name: 'user-round-cog',
		size: 24,
		node: [
			['path', { d: 'm14.305 19.53.923-.382' }],
			['path', { d: 'm15.228 16.852-.923-.383' }],
			['path', { d: 'm16.852 15.228-.383-.923' }],
			['path', { d: 'm16.852 20.772-.383.924' }],
			['path', { d: 'm19.148 15.228.383-.923' }],
			['path', { d: 'm19.53 21.696-.382-.924' }],
			['path', { d: 'M2 21a8 8 0 0 1 10.434-7.62' }],
			['path', { d: 'm20.772 16.852.924-.383' }],
			['path', { d: 'm20.772 19.148.924.383' }],
			['circle', { cx: '10', cy: '8', r: '5' }],
			['circle', { cx: '18', cy: '18', r: '3' }]
		],
		aliases: ['user-cog-2']
	};
</script>

<Icon {...props} icon={iconData} />
