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
		name: 'concierge-bell',
		size: 24,
		node: [
			['path', { d: 'M3 20a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1Z' }],
			['path', { d: 'M20 16a8 8 0 1 0-16 0' }],
			['path', { d: 'M12 4v4' }],
			['path', { d: 'M10 4h4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
