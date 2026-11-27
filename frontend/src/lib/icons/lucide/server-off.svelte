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
		name: 'server-off',
		size: 24,
		node: [
			['path', { d: 'M7 2h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5' }],
			['path', { d: 'M10 10 2.5 2.5C2 2 2 2.5 2 5v3a2 2 0 0 0 2 2h6z' }],
			['path', { d: 'M22 17v-1a2 2 0 0 0-2-2h-1' }],
			['path', { d: 'M4 14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16.5l1-.5.5.5-8-8H4z' }],
			['path', { d: 'M6 18h.01' }],
			['path', { d: 'm2 2 20 20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
