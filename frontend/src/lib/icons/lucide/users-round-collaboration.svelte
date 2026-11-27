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
		name: 'users-round-collaboration',
		size: 24,
		node: [
			['path', { d: 'M20.453 8.911a9 9 0 00-6.696-5.738' }],
			['path', { d: 'M21 22a4 4 0 00-8 0' }],
			['path', { d: 'M3 12a4 4 0 017.963-.543' }],
			['path', { d: 'M3.889 15.9a9 9 0 005.247 4.632' }],
			['circle', { cx: '17', cy: '15', r: '3' }],
			['circle', { cx: '7', cy: '5', r: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
