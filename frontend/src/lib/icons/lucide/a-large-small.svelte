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
		name: 'a-large-small',
		size: 24,
		node: [
			['path', { d: 'm15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16' }],
			['path', { d: 'M15.697 14h5.606' }],
			['path', { d: 'm2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16' }],
			['path', { d: 'M3.304 13h6.392' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
