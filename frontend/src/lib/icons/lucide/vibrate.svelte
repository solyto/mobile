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
		name: 'vibrate',
		size: 24,
		node: [
			['path', { d: 'm2 8 2 2-2 2 2 2-2 2' }],
			['path', { d: 'm22 8-2 2 2 2-2 2 2 2' }],
			['rect', { width: '8', height: '14', x: '8', y: '5', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
