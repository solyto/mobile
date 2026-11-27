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
		name: 'user-round-check',
		size: 24,
		node: [
			['path', { d: 'M2 21a8 8 0 0 1 13.292-6' }],
			['circle', { cx: '10', cy: '8', r: '5' }],
			['path', { d: 'm16 19 2 2 4-4' }]
		],
		aliases: ['user-check-2']
	};
</script>

<Icon {...props} icon={iconData} />
