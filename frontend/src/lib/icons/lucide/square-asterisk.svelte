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
		name: 'square-asterisk',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
			['path', { d: 'M12 8v8' }],
			['path', { d: 'm8.5 14 7-4' }],
			['path', { d: 'm8.5 10 7 4' }]
		],
		aliases: ['asterisk-square']
	};
</script>

<Icon {...props} icon={iconData} />
