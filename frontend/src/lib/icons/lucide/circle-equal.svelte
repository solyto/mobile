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
		name: 'circle-equal',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['path', { d: 'M7 10h10' }],
			['path', { d: 'M7 14h10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
