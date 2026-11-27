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
		name: 'server-crash',
		size: 24,
		node: [
			['path', { d: 'M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2' }],
			['path', { d: 'M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2' }],
			['path', { d: 'M6 6h.01' }],
			['path', { d: 'M6 18h.01' }],
			['path', { d: 'm13 6-4 6h6l-4 6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
