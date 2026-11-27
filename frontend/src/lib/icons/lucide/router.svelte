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
		name: 'router',
		size: 24,
		node: [
			['rect', { width: '20', height: '8', x: '2', y: '14', rx: '2' }],
			['path', { d: 'M6.01 18H6' }],
			['path', { d: 'M10.01 18H10' }],
			['path', { d: 'M15 10v4' }],
			['path', { d: 'M17.84 7.17a4 4 0 0 0-5.66 0' }],
			['path', { d: 'M20.66 4.34a8 8 0 0 0-11.31 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
