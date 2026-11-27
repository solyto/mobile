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
		name: 'square-arrow-out-up-left',
		size: 24,
		node: [
			['path', { d: 'M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6' }],
			['path', { d: 'm3 3 9 9' }],
			['path', { d: 'M3 9V3h6' }]
		],
		aliases: ['arrow-up-left-from-square']
	};
</script>

<Icon {...props} icon={iconData} />
