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
		name: 'alarm-clock-check',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '13', r: '8' }],
			['path', { d: 'M5 3 2 6' }],
			['path', { d: 'm22 6-3-3' }],
			['path', { d: 'M6.38 18.7 4 21' }],
			['path', { d: 'M17.64 18.67 20 21' }],
			['path', { d: 'm9 13 2 2 4-4' }]
		],
		aliases: ['alarm-check']
	};
</script>

<Icon {...props} icon={iconData} />
