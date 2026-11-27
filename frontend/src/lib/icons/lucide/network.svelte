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
		name: 'network',
		size: 24,
		node: [
			['rect', { x: '16', y: '16', width: '6', height: '6', rx: '1' }],
			['rect', { x: '2', y: '16', width: '6', height: '6', rx: '1' }],
			['rect', { x: '9', y: '2', width: '6', height: '6', rx: '1' }],
			['path', { d: 'M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3' }],
			['path', { d: 'M12 12V8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
