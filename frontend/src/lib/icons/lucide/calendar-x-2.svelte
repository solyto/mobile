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
		name: 'calendar-x-2',
		size: 24,
		node: [
			['path', { d: 'M16 2v3' }],
			['path', { d: 'm17 16 5 5' }],
			['path', { d: 'm17 21 5-5' }],
			['path', { d: 'M21 12V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8' }],
			['path', { d: 'M3 9h18' }],
			['path', { d: 'M8 2v3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
