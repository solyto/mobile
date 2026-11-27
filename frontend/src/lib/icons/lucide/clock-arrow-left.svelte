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
		name: 'clock-arrow-left',
		size: 24,
		node: [
			['path', { d: 'M12 6v6l1.5.8' }],
			['path', { d: 'M12.338 21.994a10 10 0 1 1 9.587-8.767' }],
			['path', { d: 'M14 18h8' }],
			['path', { d: 'm18 22-4-4 4-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
