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
		name: 'bed-single',
		size: 24,
		node: [
			['path', { d: 'M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8' }],
			['path', { d: 'M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4' }],
			['path', { d: 'M3 18h18' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
