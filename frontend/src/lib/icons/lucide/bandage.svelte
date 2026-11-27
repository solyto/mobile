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
		name: 'bandage',
		size: 24,
		node: [
			['path', { d: 'M10 10.01h.01' }],
			['path', { d: 'M10 14.01h.01' }],
			['path', { d: 'M14 10.01h.01' }],
			['path', { d: 'M14 14.01h.01' }],
			['path', { d: 'M18 6v12' }],
			['path', { d: 'M6 6v12' }],
			['rect', { x: '2', y: '6', width: '20', height: '12', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
