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
		name: 'candy-cane',
		size: 24,
		node: [
			['path', { d: 'm10.8 5 2.111 4.223' }],
			['path', { d: 'M17.75 7 15 2.1' }],
			['path', { d: 'm4.874 14.647 2.12 4.24' }],
			['path', { d: 'M5.7 21a2 2 0 0 1-3.5-2l8.6-14a6 6 0 0 1 10.4 6 2 2 0 1 1-3.464-2 2 2 0 1 0-3.464-2z' }],
			['path', { d: 'm7.906 9.712 2.005 4.411' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
