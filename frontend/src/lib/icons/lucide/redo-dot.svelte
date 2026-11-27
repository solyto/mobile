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
		name: 'redo-dot',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '17', r: '1' }],
			['path', { d: 'M21 7v6h-6' }],
			['path', { d: 'M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
