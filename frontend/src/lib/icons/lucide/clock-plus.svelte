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
		name: 'clock-plus',
		size: 24,
		node: [
			['path', { d: 'M12 6v6l3.644 1.822' }],
			['path', { d: 'M16 19h6' }],
			['path', { d: 'M19 16v6' }],
			['path', { d: 'M21.92 13.267a10 10 0 1 0-8.653 8.653' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
