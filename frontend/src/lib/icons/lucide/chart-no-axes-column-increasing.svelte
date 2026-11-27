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
		name: 'chart-no-axes-column-increasing',
		size: 24,
		node: [
			['path', { d: 'M5 21v-6' }],
			['path', { d: 'M12 21V9' }],
			['path', { d: 'M19 21V3' }]
		],
		aliases: ['bar-chart']
	};
</script>

<Icon {...props} icon={iconData} />
