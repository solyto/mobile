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
		name: 'circle-arrow-out-down-right',
		size: 24,
		node: [
			['path', { d: 'M12 22a10 10 0 1 1 10-10' }],
			['path', { d: 'M22 22 12 12' }],
			['path', { d: 'M22 16v6h-6' }]
		],
		aliases: ['arrow-down-right-from-circle']
	};
</script>

<Icon {...props} icon={iconData} />
