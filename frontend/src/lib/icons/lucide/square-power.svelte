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
		name: 'square-power',
		size: 24,
		node: [
			['path', { d: 'M12 7v4' }],
			['path', { d: 'M7.998 9.003a5 5 0 1 0 8-.005' }],
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }]
		],
		aliases: ['power-square']
	};
</script>

<Icon {...props} icon={iconData} />
