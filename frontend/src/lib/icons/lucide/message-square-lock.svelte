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
		name: 'message-square-lock',
		size: 24,
		node: [
			['path', { d: 'M22 8.5V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16.286a.71.71 0 0 0 1.212.502l2.202-2.202A2 2 0 0 1 6.828 19H10' }],
			['path', { d: 'M20 15v-2a2 2 0 0 0-4 0v2' }],
			['rect', { x: '14', y: '15', width: '8', height: '5', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
