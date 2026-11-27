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
		name: 'scooter',
		size: 24,
		node: [
			['path', { d: 'M21 4h-3.5l2 11.05' }],
			['path', { d: 'M6.95 17h5.142c.523 0 .95-.406 1.063-.916a6.5 6.5 0 0 1 5.345-5.009' }],
			['circle', { cx: '19.5', cy: '17.5', r: '2.5' }],
			['circle', { cx: '4.5', cy: '17.5', r: '2.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
