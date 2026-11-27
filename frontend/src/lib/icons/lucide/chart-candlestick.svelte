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
		name: 'chart-candlestick',
		size: 24,
		node: [
			['path', { d: 'M9 5v4' }],
			['rect', { width: '4', height: '6', x: '7', y: '9', rx: '1' }],
			['path', { d: 'M9 15v2' }],
			['path', { d: 'M17 3v2' }],
			['rect', { width: '4', height: '8', x: '15', y: '5', rx: '1' }],
			['path', { d: 'M17 13v3' }],
			['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }]
		],
		aliases: ['candlestick-chart']
	};
</script>

<Icon {...props} icon={iconData} />
