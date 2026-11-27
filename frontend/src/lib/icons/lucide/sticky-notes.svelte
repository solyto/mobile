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
		name: 'sticky-notes',
		size: 24,
		node: [
			['path', { d: 'M10 8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 16 14v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z' }],
			['path', { d: 'M10 8v5a1 1 0 0 0 1 1h5' }],
			['path', { d: 'M8 4a2 2 0 0 1 2-2h6a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 22 8v6a2 2 0 0 1-2 2' }],
			['path', { d: 'M16 2v5a1 1 0 0 0 1 1h5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
