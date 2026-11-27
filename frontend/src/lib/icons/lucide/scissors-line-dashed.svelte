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
		name: 'scissors-line-dashed',
		size: 24,
		node: [
			['path', { d: 'M5.42 9.42 8 12' }],
			['circle', { cx: '4', cy: '8', r: '2' }],
			['path', { d: 'm14 6-8.58 8.58' }],
			['circle', { cx: '4', cy: '16', r: '2' }],
			['path', { d: 'M10.8 14.8 14 18' }],
			['path', { d: 'M16 12h-2' }],
			['path', { d: 'M22 12h-2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
