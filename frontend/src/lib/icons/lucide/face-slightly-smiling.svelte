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
		name: 'face-slightly-smiling',
		size: 24,
		node: [
			['path', { d: 'M15 10V9' }],
			['path', { d: 'M16.472 15a6 6 0 01-8.943 0' }],
			['path', { d: 'M9 10V9' }],
			['circle', { cx: '12', cy: '12', r: '10' }]
		],
		aliases: ['smile']
	};
</script>

<Icon {...props} icon={iconData} />
