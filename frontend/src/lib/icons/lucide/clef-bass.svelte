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
		name: 'clef-bass',
		size: 24,
		node: [
			['path', { d: 'M19 11h.01' }],
			['path', { d: 'M19 6h.01' }],
			['path', { d: 'M5 8c0-4 4-4 4-4 6 0 6 6 6 6 0 7-10 11-10 11' }],
			['circle', { cx: '7', cy: '8', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
