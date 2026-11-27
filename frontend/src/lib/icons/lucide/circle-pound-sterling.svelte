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
		name: 'circle-pound-sterling',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['path', { d: 'M10 16V9.5a1 1 0 0 1 5 0' }],
			['path', { d: 'M8 12h4' }],
			['path', { d: 'M8 16h7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
