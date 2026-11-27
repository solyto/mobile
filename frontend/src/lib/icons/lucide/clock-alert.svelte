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
		name: 'clock-alert',
		size: 24,
		node: [
			['path', { d: 'M12 6v6l4 2' }],
			['path', { d: 'M20 12v5' }],
			['path', { d: 'M20 21h.01' }],
			['path', { d: 'M21.25 8.2A10 10 0 1 0 16 21.16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
