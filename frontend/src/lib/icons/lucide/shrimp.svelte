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
		name: 'shrimp',
		size: 24,
		node: [
			['path', { d: 'M10 2a3.28 3.28 0 003.227 1.798l6.17-.561A1 1 0 1119.614 8H8.5a6.44 6.44 0 00-5.63 9.75A6.5 6.5 0 008.5 21c1.38 0 2-.5 2.5-1' }],
			['path', { d: 'M10 8a8.5 8.5 0 000 8' }],
			['path', { d: 'M11 22c-.5-.5-1.12-1-2.5-1a1 1 0 010-5H12a7 7 0 007-7V8' }],
			['path', { d: 'M13 12h.01' }],
			['path', { d: 'M8 16c-2 0-4.5-4-4-6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
