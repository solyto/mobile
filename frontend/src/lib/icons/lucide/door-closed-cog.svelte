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
		name: 'door-closed-cog',
		size: 24,
		node: [
			['path', { d: 'm14.305 19.53.923-.382' }],
			['path', { d: 'm15.229 16.852-.924-.383' }],
			['path', { d: 'm16.852 15.228-.383-.923' }],
			['path', { d: 'm16.852 20.773-.383.924' }],
			['path', { d: 'M19 10.35V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' }],
			['path', { d: 'm19.148 15.228.383-.923' }],
			['path', { d: 'm19.53 21.697-.382-.924' }],
			['path', { d: 'M2 21h8.58' }],
			['path', { d: 'm20.773 16.852.922-.383' }],
			['path', { d: 'm20.773 19.148.922.383' }],
			['path', { d: 'M9 12h.01' }],
			['circle', { cx: '18', cy: '18', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
