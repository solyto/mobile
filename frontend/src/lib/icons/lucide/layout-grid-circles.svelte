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
		name: 'layout-grid-circles',
		size: 24,
		node: [
			['circle', { cx: '17.5', cy: '17.5', r: '3.5' }],
			['circle', { cx: '17.5', cy: '6.5', r: '3.5' }],
			['circle', { cx: '6.5', cy: '17.5', r: '3.5' }],
			['circle', { cx: '6.5', cy: '6.5', r: '3.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
