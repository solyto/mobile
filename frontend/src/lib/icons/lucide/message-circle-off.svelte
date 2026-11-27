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
		name: 'message-circle-off',
		size: 24,
		node: [
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M4.93 4.929a10 10 0 0 0-1.938 11.412 2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 0 0 11.302-1.989' }],
			['path', { d: 'M8.35 2.69A10 10 0 0 1 21.3 15.65' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
