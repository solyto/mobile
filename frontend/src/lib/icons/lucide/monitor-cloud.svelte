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
		name: 'monitor-cloud',
		size: 24,
		node: [
			['path', { d: 'M11 13a3 3 0 1 1 2.83-4H14a2 2 0 0 1 0 4z' }],
			['path', { d: 'M12 17v4' }],
			['path', { d: 'M8 21h8' }],
			['rect', { x: '2', y: '3', width: '20', height: '14', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
