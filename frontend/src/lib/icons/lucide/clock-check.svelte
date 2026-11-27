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
		name: 'clock-check',
		size: 24,
		node: [
			['path', { d: 'M21.95 13a10 10 0 1 0-8.685 8.92' }],
			['path', { d: 'M12 6v6l4 2' }],
			['path', { d: 'm16 19 2 2 4-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
