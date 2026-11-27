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
		name: 'shrimp-off',
		size: 24,
		node: [
			['path', { d: 'M10 2a3.28 3.28 0 003.227 1.798l6.17-.561A1 1 0 1119.614 8H13.5' }],
			['path', { d: 'M11 20c-.5.5-1.12 1-2.5 1a1 1 0 010-5H12a7 7 0 003.283-.817' }],
			['path', { d: 'M11 22c-.5-.5-1.12-1-2.5-1a6.5 6.5 0 01-5.63-3.25 6.44 6.44 0 015.236-9.744' }],
			['path', { d: 'M18.04 12.54A7 7 0 0019 9V8' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M8 16c-2 0-4.5-4-4-6' }],
			['path', { d: 'M9.43 9.33A8.5 8.5 0 0010 16' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
