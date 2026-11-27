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
		name: 'plug',
		size: 24,
		node: [
			['path', { d: 'M12 22v-5' }],
			['path', { d: 'M15 8V2' }],
			['path', { d: 'M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z' }],
			['path', { d: 'M9 8V2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
