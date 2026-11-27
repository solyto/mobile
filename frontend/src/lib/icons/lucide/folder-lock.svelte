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
		name: 'folder-lock',
		size: 24,
		node: [
			['rect', { width: '8', height: '5', x: '14', y: '17', rx: '1' }],
			['path', { d: 'M10 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2.5' }],
			['path', { d: 'M20 17v-2a2 2 0 1 0-4 0v2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
