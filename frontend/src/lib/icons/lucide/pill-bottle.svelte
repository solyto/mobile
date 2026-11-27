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
		name: 'pill-bottle',
		size: 24,
		node: [
			['path', { d: 'M18 11h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h4' }],
			['path', { d: 'M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7' }],
			['rect', { width: '16', height: '5', x: '4', y: '2', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
