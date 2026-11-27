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
		name: 'square-m',
		size: 24,
		node: [
			['path', { d: 'M8 16V8.5a.5.5 0 0 1 .9-.3l2.7 3.599a.5.5 0 0 0 .8 0l2.7-3.6a.5.5 0 0 1 .9.3V16' }],
			['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }]
		],
		aliases: ['m-square']
	};
</script>

<Icon {...props} icon={iconData} />
