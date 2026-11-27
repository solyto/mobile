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
		name: 'mail',
		size: 24,
		node: [
			['path', { d: 'm22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7' }],
			['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
