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
		name: 'undo-dot',
		size: 24,
		node: [
			['path', { d: 'M21 17a9 9 0 0 0-15-6.7L3 13' }],
			['path', { d: 'M3 7v6h6' }],
			['circle', { cx: '12', cy: '17', r: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
