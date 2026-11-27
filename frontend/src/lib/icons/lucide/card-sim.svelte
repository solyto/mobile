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
		name: 'card-sim',
		size: 24,
		node: [
			['path', { d: 'M12 14v4' }],
			['path', { d: 'M14.172 2a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 20 7.828V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z' }],
			['path', { d: 'M8 14h8' }],
			['rect', { x: '8', y: '10', width: '8', height: '8', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
