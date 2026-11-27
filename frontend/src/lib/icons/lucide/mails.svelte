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
		name: 'mails',
		size: 24,
		node: [
			['path', { d: 'M17 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 1-1.732' }],
			['path', { d: 'm22 5.5-6.419 4.179a2 2 0 0 1-2.162 0L7 5.5' }],
			['rect', { x: '7', y: '3', width: '15', height: '12', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
