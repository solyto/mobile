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
		name: 'square-code',
		size: 24,
		node: [
			['path', { d: 'm10 9-3 3 3 3' }],
			['path', { d: 'm14 15 3-3-3-3' }],
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }]
		],
		aliases: ['code-square']
	};
</script>

<Icon {...props} icon={iconData} />
