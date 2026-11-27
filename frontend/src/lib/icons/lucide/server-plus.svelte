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
		name: 'server-plus',
		size: 24,
		node: [
			['path', { d: 'M12.5 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2' }],
			['path', { d: 'M16 12h6' }],
			['path', { d: 'M19 9v6' }],
			['path', { d: 'M22 18v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h8.5' }],
			['path', { d: 'M6 18h.01' }],
			['path', { d: 'M6 6h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
