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
		name: 'clock-arrow-down',
		size: 24,
		node: [
			['path', { d: 'M12 6v6l2 1' }],
			['path', { d: 'M12.337 21.994a10 10 0 1 1 9.588-8.767' }],
			['path', { d: 'm14 18 4 4 4-4' }],
			['path', { d: 'M18 14v8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
