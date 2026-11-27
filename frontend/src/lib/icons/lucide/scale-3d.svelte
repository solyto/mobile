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
		name: 'scale-3d',
		size: 24,
		node: [
			['path', { d: 'M5 7v11a1 1 0 0 0 1 1h11' }],
			['path', { d: 'M5.293 18.707 11 13' }],
			['circle', { cx: '19', cy: '19', r: '2' }],
			['circle', { cx: '5', cy: '5', r: '2' }]
		],
		aliases: ['scale-3-d']
	};
</script>

<Icon {...props} icon={iconData} />
