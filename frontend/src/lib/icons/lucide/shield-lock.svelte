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
		name: 'shield-lock',
		size: 24,
		node: [
			['path', { d: 'M20 9.807V6a1 1 0 00-1-1c-2 0-4.49-1.19-6.24-2.72a1.17 1.17 0 00-1.52 0C9.5 3.8 7 5 5 5a1 1 0 00-1 1v7c0 3.88 2.107 6.254 5 7.796' }],
			['path', { d: 'M19 17v-2a2 2 0 00-4 0v2' }],
			['rect', { x: '13', y: '17', width: '8', height: '5', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
