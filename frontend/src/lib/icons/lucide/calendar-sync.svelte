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
		name: 'calendar-sync',
		size: 24,
		node: [
			['path', { d: 'M11 10v4h4' }],
			['path', { d: 'm11 14 1.535-1.605a5 5 0 018 1.5' }],
			['path', { d: 'M16 2v3' }],
			['path', { d: 'm21 18-1.535 1.605a5 5 0 01-8-1.5' }],
			['path', { d: 'M21 22v-4h-4' }],
			['path', { d: 'M21 8.517V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h3.517' }],
			['path', { d: 'M3 9h4' }],
			['path', { d: 'M8 2v3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
