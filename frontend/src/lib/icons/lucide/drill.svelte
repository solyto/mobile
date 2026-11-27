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
		name: 'drill',
		size: 24,
		node: [
			['path', { d: 'M10 18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a3 3 0 0 1-3-3 1 1 0 0 1 1-1z' }],
			['path', { d: 'M13 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1l-.81 3.242a1 1 0 0 1-.97.758H8' }],
			['path', { d: 'M14 4h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3' }],
			['path', { d: 'M18 6h4' }],
			['path', { d: 'm5 10-2 8' }],
			['path', { d: 'm7 18 2-8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
