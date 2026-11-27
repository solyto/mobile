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
		name: 'wifi-off',
		size: 24,
		node: [
			['path', { d: 'M12 20h.01' }],
			['path', { d: 'M8.5 16.429a5 5 0 0 1 7 0' }],
			['path', { d: 'M5 12.859a10 10 0 0 1 5.17-2.69' }],
			['path', { d: 'M19 12.859a10 10 0 0 0-2.007-1.523' }],
			['path', { d: 'M2 8.82a15 15 0 0 1 4.177-2.643' }],
			['path', { d: 'M22 8.82a15 15 0 0 0-11.288-3.764' }],
			['path', { d: 'm2 2 20 20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
