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
		name: 'calendar-arrow-up',
		size: 24,
		node: [
			['path', { d: 'm14 17 4-4 4 4' }],
			['path', { d: 'M16 2v3' }],
			['path', { d: 'M18 21v-8' }],
			['path', { d: 'M21 10.343V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h9' }],
			['path', { d: 'M3 9h18' }],
			['path', { d: 'M8 2v3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
