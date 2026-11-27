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
		name: 'user-round-x',
		size: 24,
		node: [
			['path', { d: 'm16.5 16.5 5 5' }],
			['path', { d: 'M2 21a8 8 0 0 1 11.531-7.18' }],
			['path', { d: 'm21.5 16.5-5 5' }],
			['circle', { cx: '10', cy: '8', r: '5' }]
		],
		aliases: ['user-x-2']
	};
</script>

<Icon {...props} icon={iconData} />
