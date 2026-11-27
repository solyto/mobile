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
		name: 'lasso',
		size: 24,
		node: [
			['path', { d: 'M3.704 14.467a10 8 0 1 1 3.115 2.375' }],
			['path', { d: 'M7 22a5 5 0 0 1-2-3.994' }],
			['circle', { cx: '5', cy: '16', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
