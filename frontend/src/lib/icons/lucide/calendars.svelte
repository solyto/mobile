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
		name: 'calendars',
		size: 24,
		node: [
			['path', { d: 'M12 2v2' }],
			['path', { d: 'M15.726 21.01A2 2 0 0 1 14 22H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2' }],
			['path', { d: 'M18 2v2' }],
			['path', { d: 'M2 13h2' }],
			['path', { d: 'M8 8h14' }],
			['rect', { x: '8', y: '3', width: '14', height: '14', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
