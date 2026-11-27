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
		name: 'face-angry',
		size: 24,
		node: [
			['path', { d: 'M15 12v-1.584' }],
			['path', { d: 'M17 10a5 5 0 00-3 1' }],
			['path', { d: 'M7 10a5 5 0 013 1' }],
			['path', { d: 'M9 12v-1.584' }],
			['path', { d: 'M9 17a5 5 0 016.001 0' }],
			['circle', { cx: '12', cy: '12', r: '10' }]
		],
		aliases: ['angry']
	};
</script>

<Icon {...props} icon={iconData} />
