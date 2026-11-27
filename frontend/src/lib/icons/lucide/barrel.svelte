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
		name: 'barrel',
		size: 24,
		node: [
			['path', { d: 'M10.5 2a34.5 34.5 0 000 20' }],
			['path', { d: 'M13.5 2a34.5 34.5 0 010 20' }],
			['path', { d: 'M4.67 17h14.67' }],
			['path', { d: 'M4.67 7h14.67' }],
			['path', { d: 'M6.23 3.06a19 19 0 000 17.88A2 2 0 008 22h8a2 2 0 001.77-1.06 19 19 0 000-17.88A2 2 0 0016 2H8a2 2 0 00-1.77 1.06' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
