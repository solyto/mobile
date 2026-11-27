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
		name: 'wallet-minimal',
		size: 24,
		node: [
			['path', { d: 'M17 14h.01' }],
			['path', { d: 'M7 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14' }]
		],
		aliases: ['wallet-2']
	};
</script>

<Icon {...props} icon={iconData} />
