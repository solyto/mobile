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
		name: 'file-lock',
		size: 24,
		node: [
			['path', { d: 'M4 9.8V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3' }],
			['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }],
			['path', { d: 'M9 17v-2a2 2 0 0 0-4 0v2' }],
			['rect', { width: '8', height: '5', x: '3', y: '17', rx: '1' }]
		],
		aliases: ['file-lock-2']
	};
</script>

<Icon {...props} icon={iconData} />
