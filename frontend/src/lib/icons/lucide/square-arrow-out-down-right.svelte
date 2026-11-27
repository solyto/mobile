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
		name: 'square-arrow-out-down-right',
		size: 24,
		node: [
			['path', { d: 'M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6' }],
			['path', { d: 'm21 21-9-9' }],
			['path', { d: 'M21 15v6h-6' }]
		],
		aliases: ['arrow-down-right-from-square']
	};
</script>

<Icon {...props} icon={iconData} />
