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
		name: 'git-pull-request',
		size: 24,
		node: [
			['circle', { cx: '18', cy: '18', r: '3' }],
			['circle', { cx: '6', cy: '6', r: '3' }],
			['path', { d: 'M13 6h3a2 2 0 0 1 2 2v7' }],
			['line', { x1: '6', x2: '6', y1: '9', y2: '21' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
