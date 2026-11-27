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
		name: 'wifi-high',
		size: 24,
		node: [
			['path', { d: 'M12 20h.01' }],
			['path', { d: 'M5 12.859a10 10 0 0 1 14 0' }],
			['path', { d: 'M8.5 16.429a5 5 0 0 1 7 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
