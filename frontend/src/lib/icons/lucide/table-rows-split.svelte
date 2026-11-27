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
		name: 'table-rows-split',
		size: 24,
		node: [
			['path', { d: 'M14 10h2' }],
			['path', { d: 'M15 22v-8' }],
			['path', { d: 'M15 2v4' }],
			['path', { d: 'M2 10h2' }],
			['path', { d: 'M20 10h2' }],
			['path', { d: 'M3 19h18' }],
			['path', { d: 'M3 22v-6a2 2 135 0 1 2-2h14a2 2 45 0 1 2 2v6' }],
			['path', { d: 'M3 2v2a2 2 45 0 0 2 2h14a2 2 135 0 0 2-2V2' }],
			['path', { d: 'M8 10h2' }],
			['path', { d: 'M9 22v-8' }],
			['path', { d: 'M9 2v4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
