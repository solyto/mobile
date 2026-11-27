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
		name: 'sticky-note-off',
		size: 24,
		node: [
			['path', { d: 'M15 3v5a1 1 0 0 0 1 1h5' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M3.586 3.586A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 1.414-.586' }],
			['path', { d: 'M8.656 3H15a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 21 9v6.344' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
