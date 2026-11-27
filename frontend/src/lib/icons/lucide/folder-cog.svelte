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
		name: 'folder-cog',
		size: 24,
		node: [
			['path', { d: 'M10.3 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.98a2 2 0 0 1 1.69.9l.66 1.2A2 2 0 0 0 12 6h8a2 2 0 0 1 2 2v3.3' }],
			['path', { d: 'm14.305 19.53.923-.382' }],
			['path', { d: 'm15.228 16.852-.923-.383' }],
			['path', { d: 'm16.852 15.228-.383-.923' }],
			['path', { d: 'm16.852 20.772-.383.924' }],
			['path', { d: 'm19.148 15.228.383-.923' }],
			['path', { d: 'm19.53 21.696-.382-.924' }],
			['path', { d: 'm20.772 16.852.924-.383' }],
			['path', { d: 'm20.772 19.148.924.383' }],
			['circle', { cx: '18', cy: '18', r: '3' }]
		],
		aliases: ['folder-cog-2']
	};
</script>

<Icon {...props} icon={iconData} />
