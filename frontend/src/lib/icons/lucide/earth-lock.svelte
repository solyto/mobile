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
		name: 'earth-lock',
		size: 24,
		node: [
			['path', { d: 'M7 3.34V5a3 3 0 0 0 3 3' }],
			['path', { d: 'M11 21.95V18a2 2 0 0 0-2-2 2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05' }],
			['path', { d: 'M21.54 15H17a2 2 0 0 0-2 2v4.54' }],
			['path', { d: 'M12 2a10 10 0 1 0 9.54 13' }],
			['path', { d: 'M20 6V4a2 2 0 1 0-4 0v2' }],
			['rect', { width: '8', height: '5', x: '14', y: '6', rx: '1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
