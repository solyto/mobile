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
		name: 'house-cog',
		size: 24,
		node: [
			['path', { d: 'M10.584 21H5a2 2 0 01-2-2v-9a2 2 0 01.709-1.527l7-6a2 2 0 012.582 0l7 6A2 2 0 0121 10.001v.583' }],
			['path', { d: 'M14 12H10a1 1 0 00-1 1v8' }],
			['path', { d: 'm14.305 19.53.923-.382' }],
			['path', { d: 'm15.229 16.852-.924-.383' }],
			['path', { d: 'm16.852 15.228-.383-.923' }],
			['path', { d: 'm16.852 20.773-.383.924' }],
			['path', { d: 'm19.148 15.228.383-.923' }],
			['path', { d: 'm19.53 21.697-.382-.924' }],
			['path', { d: 'm20.773 16.852.922-.383' }],
			['path', { d: 'm20.773 19.148.922.383' }],
			['circle', { cx: '18', cy: '18', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
