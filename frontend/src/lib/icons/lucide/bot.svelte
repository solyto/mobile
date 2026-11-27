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
		name: 'bot',
		size: 24,
		node: [
			['path', { d: 'M12 8V4H8' }],
			['rect', { width: '16', height: '12', x: '4', y: '8', rx: '2' }],
			['path', { d: 'M2 14h2' }],
			['path', { d: 'M20 14h2' }],
			['path', { d: 'M15 13v2' }],
			['path', { d: 'M9 13v2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
