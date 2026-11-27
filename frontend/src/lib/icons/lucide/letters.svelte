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
		name: 'letters',
		size: 24,
		node: [
			['path', { d: 'M15 8H9' }],
			['path', { d: 'M21 15.354a4 4 0 100 5.292' }],
			['path', { d: 'M3 18h4a2 2 0 010 4H3.5a.5.5 0 01-.5-.5v-7a.5.5 0 01.5-.5H6a2 2 0 010 4' }],
			['path', { d: 'm8 10 3.453-7.648a.6.6 0 011.094 0L16 10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
