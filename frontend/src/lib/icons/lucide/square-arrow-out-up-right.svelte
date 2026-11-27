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
		name: 'square-arrow-out-up-right',
		size: 24,
		node: [
			['path', { d: 'M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6' }],
			['path', { d: 'm21 3-9 9' }],
			['path', { d: 'M15 3h6v6' }]
		],
		aliases: ['arrow-up-right-from-square']
	};
</script>

<Icon {...props} icon={iconData} />
