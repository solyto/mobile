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
		name: 'between-horizontal-start',
		size: 24,
		node: [
			['rect', { width: '13', height: '7', x: '8', y: '3', rx: '1' }],
			['path', { d: 'm2 9 3 3-3 3' }],
			['rect', { width: '13', height: '7', x: '8', y: '14', rx: '1' }]
		],
		aliases: ['between-horizonal-start']
	};
</script>

<Icon {...props} icon={iconData} />
