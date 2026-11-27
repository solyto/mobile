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
		name: 'hand-fist',
		size: 24,
		node: [
			['path', { d: 'M12.035 17.012a3 3 0 0 0-3-3l-.311-.002a.72.72 0 0 1-.505-1.229l1.195-1.195A2 2 0 0 1 10.828 11H12a2 2 0 0 0 0-4H9.243a3 3 0 0 0-2.122.879l-2.707 2.707A4.83 4.83 0 0 0 3 14a8 8 0 0 0 8 8h2a8 8 0 0 0 8-8V7a2 2 0 1 0-4 0v2a2 2 0 1 0 4 0' }],
			['path', { d: 'M13.888 9.662A2 2 0 0 0 17 8V5A2 2 0 1 0 13 5' }],
			['path', { d: 'M9 5A2 2 0 1 0 5 5V10' }],
			['path', { d: 'M9 7V4A2 2 0 1 1 13 4V7.268' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
