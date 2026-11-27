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
		name: 'archive-restore',
		size: 24,
		node: [
			['rect', { width: '20', height: '5', x: '2', y: '3', rx: '1' }],
			['path', { d: 'M4 8v11a2 2 0 0 0 2 2h2' }],
			['path', { d: 'M20 8v11a2 2 0 0 1-2 2h-2' }],
			['path', { d: 'm9 15 3-3 3 3' }],
			['path', { d: 'M12 12v9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
