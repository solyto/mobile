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
		name: 'circle-arrow-right',
		size: 24,
		node: [
			['circle', { cx: '12', cy: '12', r: '10' }],
			['path', { d: 'm12 16 4-4-4-4' }],
			['path', { d: 'M8 12h8' }]
		],
		aliases: ['arrow-right-circle']
	};
</script>

<Icon {...props} icon={iconData} />
