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
		name: 'circle-pause',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['line', { x1: '10', x2: '10', y1: '15', y2: '9' }],
			['line', { x1: '14', x2: '14', y1: '15', y2: '9' }]
		],
		aliases: ['pause-circle']
	};
</script>

<Icon {...props} icon={iconData} />
