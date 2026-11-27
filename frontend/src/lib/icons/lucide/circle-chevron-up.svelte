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
		name: 'circle-chevron-up',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['path', { d: 'm8 14 4-4 4 4' }]
		],
		aliases: ['chevron-up-circle']
	};
</script>

<Icon {...props} icon={iconData} />
