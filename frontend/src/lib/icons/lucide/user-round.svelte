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
		name: 'user-round',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '8', r: '5' }],
			['path', { d: 'M20 21a8 8 0 0 0-16 0' }]
		],
		aliases: ['user-2']
	};
</script>

<Icon {...props} icon={iconData} />
