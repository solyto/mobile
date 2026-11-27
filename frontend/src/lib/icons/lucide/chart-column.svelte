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
		name: 'chart-column',
		size: 24,
		node: [
			['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
			['path', { d: 'M18 17V9' }],
			['path', { d: 'M13 17V5' }],
			['path', { d: 'M8 17v-3' }]
		],
		aliases: ['bar-chart-3']
	};
</script>

<Icon {...props} icon={iconData} />
