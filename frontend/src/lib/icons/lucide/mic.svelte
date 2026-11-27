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
		name: 'mic',
		size: 24,
		node: [
			['path', { d: 'M12 19v3' }],
			['path', { d: 'M19 10v2a7 7 0 0 1-14 0v-2' }],
			['rect', { x: '9', y: '2', width: '6', height: '13', rx: '3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
