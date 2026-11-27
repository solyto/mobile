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
		name: 'door-open',
		size: 24,
		node: [
			['path', { d: 'M10 21H2' }],
			['path', { d: 'M10 3H7a2 2 0 00-2 2v16' }],
			['path', { d: 'M14 12h.01' }],
			['path', { d: 'M19 21V5a2 2 0 00-1.675-1.974l-6.163-1.013A1 1 0 0010 3v18a1 1 0 001.124.992z' }],
			['path', { d: 'M22 21h-3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
