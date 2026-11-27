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
		name: 'grid-2x2-plus',
		size: 24,
		node: [
			['path', { d: 'M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3' }],
			['path', { d: 'M16 19h6' }],
			['path', { d: 'M19 22v-6' }]
		],
		aliases: ['grid-2-x-2-plus']
	};
</script>

<Icon {...props} icon={iconData} />
