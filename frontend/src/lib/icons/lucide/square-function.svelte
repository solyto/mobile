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
		name: 'square-function',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
			['path', { d: 'M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3' }],
			['path', { d: 'M9 11.2h5.7' }]
		],
		aliases: ['function-square']
	};
</script>

<Icon {...props} icon={iconData} />
