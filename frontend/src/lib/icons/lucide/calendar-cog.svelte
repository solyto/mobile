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
		name: 'calendar-cog',
		size: 24,
		node: [
			['path', { d: 'm15.228 16.852-.923-.383' }],
			['path', { d: 'm15.228 19.148-.923.383' }],
			['path', { d: 'M16 2v3' }],
			['path', { d: 'm16.47 14.305.382.923' }],
			['path', { d: 'm16.852 20.772-.383.924' }],
			['path', { d: 'm19.148 15.228.383-.923' }],
			['path', { d: 'm19.53 21.696-.382-.924' }],
			['path', { d: 'm20.773 16.852.924-.383' }],
			['path', { d: 'm20.773 19.148.924.383' }],
			['path', { d: 'M21 10.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h5.5' }],
			['path', { d: 'M3 9h18' }],
			['path', { d: 'M8 2v3' }],
			['circle', { cx: '18', cy: '18', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
