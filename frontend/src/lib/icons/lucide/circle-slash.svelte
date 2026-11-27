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
		name: 'circle-slash',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['line', { x1: '9', x2: '15', y1: '15', y2: '9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
