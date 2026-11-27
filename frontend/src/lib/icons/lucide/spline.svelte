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
		name: 'spline',
		size: 24,
		node: [
			['circle', { cx: '19', cy: '5', r: '2' }],
			['circle', { cx: '5', cy: '19', r: '2' }],
			['path', { d: 'M5 17A12 12 0 0 1 17 5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
