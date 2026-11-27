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
		name: 'wine',
		size: 24,
		node: [
			['path', { d: 'M8 22h8' }],
			['path', { d: 'M7 10h10' }],
			['path', { d: 'M12 15v7' }],
			['path', { d: 'M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
