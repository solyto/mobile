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
		name: 'rotate-ccw-clock',
		size: 24,
		node: [
			['path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }],
			['path', { d: 'M3 3v5h5' }],
			['path', { d: 'M12 7v5l4 2' }]
		],
		aliases: ['history']
	};
</script>

<Icon {...props} icon={iconData} />
