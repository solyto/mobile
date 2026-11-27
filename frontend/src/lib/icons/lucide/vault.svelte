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
		name: 'vault',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
			['circle', { cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor' }],
			['path', { d: 'm7.9 7.9 2.7 2.7' }],
			['circle', { cx: '16.5', cy: '7.5', r: '.5', fill: 'currentColor' }],
			['path', { d: 'm13.4 10.6 2.7-2.7' }],
			['circle', { cx: '7.5', cy: '16.5', r: '.5', fill: 'currentColor' }],
			['path', { d: 'm7.9 16.1 2.7-2.7' }],
			['circle', { cx: '16.5', cy: '16.5', r: '.5', fill: 'currentColor' }],
			['path', { d: 'm13.4 13.4 2.7 2.7' }],
			['circle', { cx: '12', cy: '12', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
