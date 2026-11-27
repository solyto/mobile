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
		name: 'wifi-cog',
		size: 24,
		node: [
			['path', { d: 'm14.305 19.53.923-.382' }],
			['path', { d: 'm15.228 16.852-.923-.383' }],
			['path', { d: 'm16.852 15.228-.383-.923' }],
			['path', { d: 'm16.852 20.772-.383.924' }],
			['path', { d: 'm19.148 15.228.383-.923' }],
			['path', { d: 'm19.53 21.696-.382-.924' }],
			['path', { d: 'M2 8.82a15 15 0 0120 0' }],
			['path', { d: 'm20.772 16.852.924-.383' }],
			['path', { d: 'm20.772 19.148.924.383' }],
			['path', { d: 'M5 12.859a10 10 0 0110.18-2.342' }],
			['path', { d: 'M8.5 16.429a5 5 0 011.998-1.2' }],
			['circle', { cx: '18', cy: '18', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
