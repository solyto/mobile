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
		name: 'microwave',
		size: 24,
		node: [
			['rect', { width: '20', height: '15', x: '2', y: '4', rx: '2' }],
			['rect', { width: '8', height: '7', x: '6', y: '8', rx: '1' }],
			['path', { d: 'M18 8v7' }],
			['path', { d: 'M6 19v2' }],
			['path', { d: 'M18 19v2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
