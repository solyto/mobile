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
		name: 'bubbles',
		size: 24,
		node: [
			['path', { d: 'M7.001 15.085A1.5 1.5 0 0 1 9 16.5' }],
			['circle', { cx: '18.5', cy: '8.5', r: '3.5' }],
			['circle', { cx: '7.5', cy: '16.5', r: '5.5' }],
			['circle', { cx: '7.5', cy: '4.5', r: '2.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
