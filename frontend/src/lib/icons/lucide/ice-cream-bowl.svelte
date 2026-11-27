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
		name: 'ice-cream-bowl',
		size: 24,
		node: [
			['path', { d: 'M12 17c5 0 8-2.69 8-6H4c0 3.31 3 6 8 6m-4 4h8m-4-3v3M5.14 11a3.5 3.5 0 1 1 6.71 0' }],
			['path', { d: 'M12.14 11a3.5 3.5 0 1 1 6.71 0' }],
			['path', { d: 'M15.5 6.5a3.5 3.5 0 1 0-7 0' }]
		],
		aliases: ['ice-cream-2']
	};
</script>

<Icon {...props} icon={iconData} />
