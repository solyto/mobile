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
		name: 'panel-left-dashed',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
			['path', { d: 'M9 14v1' }],
			['path', { d: 'M9 19v2' }],
			['path', { d: 'M9 3v2' }],
			['path', { d: 'M9 9v1' }]
		],
		aliases: ['panel-left-inactive']
	};
</script>

<Icon {...props} icon={iconData} />
