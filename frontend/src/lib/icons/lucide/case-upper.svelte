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
		name: 'case-upper',
		size: 24,
		node: [
			['path', { d: 'M15 11h4.5a1 1 0 0 1 0 5h-4a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h3a1 1 0 0 1 0 5' }],
			['path', { d: 'm2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16' }],
			['path', { d: 'M3.304 13h6.392' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
