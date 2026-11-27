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
		name: 'chart-no-axes-gantt',
		size: 24,
		node: [
			['path', { d: 'M6 5h12' }],
			['path', { d: 'M4 12h10' }],
			['path', { d: 'M12 19h8' }]
		],
		aliases: ['gantt-chart']
	};
</script>

<Icon {...props} icon={iconData} />
