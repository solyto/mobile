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
		name: 'usb',
		size: 24,
		node: [
			['circle', { cx: '10', cy: '7', r: '1' }],
			['circle', { cx: '4', cy: '20', r: '1' }],
			['path', { d: 'M4.7 19.3 19 5' }],
			['path', { d: 'm21 3-3 1 2 2Z' }],
			['path', { d: 'M9.26 7.68 5 12l2 5' }],
			['path', { d: 'm10 14 5 2 3.5-3.5' }],
			['path', { d: 'm18 12 1-1 1 1-1 1Z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
