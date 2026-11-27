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
		name: 'tag-x',
		size: 24,
		node: [
			['path', { d: 'm16.5 6.5-3.914-3.914A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.43 2.43 0 0 0 3.42 0l1.79-1.79' }],
			['path', { d: 'm16.5 10.5 5 5' }],
			['path', { d: 'm21.5 10.5-5 5' }],
			['circle', { cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
