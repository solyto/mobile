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
		name: 'circle-alert',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['line', { x1: '12', x2: '12', y1: '8', y2: '12' }],
			['line', { x1: '12', x2: '12.01', y1: '16', y2: '16' }]
		],
		aliases: ['alert-circle']
	};
</script>

<Icon {...props} icon={iconData} />
