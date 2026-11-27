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
		name: 'rat',
		size: 24,
		node: [
			['path', { d: 'M13 22H4a2 2 0 0 1 0-4h12' }],
			['path', { d: 'M13.236 18a3 3 0 0 0-2.2-5' }],
			['path', { d: 'M16 9h.01' }],
			['path', { d: 'M16.82 3.94a3 3 0 1 1 3.237 4.868l1.815 2.587a1.5 1.5 0 0 1-1.5 2.1l-2.872-.453a3 3 0 0 0-3.5 3' }],
			['path', { d: 'M17 4.988a3 3 0 1 0-5.2 2.052A7 7 0 0 0 4 14.015 4 4 0 0 0 8 18' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
