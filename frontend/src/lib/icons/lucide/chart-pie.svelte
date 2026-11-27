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
		name: 'chart-pie',
		size: 24,
		node: [
			['path', { d: 'M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z' }],
			['path', { d: 'M21.21 15.89A10 10 0 1 1 8 2.83' }]
		],
		aliases: ['pie-chart']
	};
</script>

<Icon {...props} icon={iconData} />
