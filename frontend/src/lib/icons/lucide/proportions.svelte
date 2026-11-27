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
		name: 'proportions',
		size: 24,
		node: [
			['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
			['path', { d: 'M12 9v11' }],
			['path', { d: 'M2 9h13a2 2 0 0 1 2 2v9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
