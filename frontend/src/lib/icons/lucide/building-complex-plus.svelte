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
		name: 'building-complex-plus',
		size: 24,
		node: [
			['path', { d: 'M10 12h4' }],
			['path', { d: 'M10 21v-3a2 2 0 013.05-1.702' }],
			['path', { d: 'M10 8h4' }],
			['path', { d: 'M16 19h6' }],
			['path', { d: 'M18 7h2a2 2 0 012 2v4.355' }],
			['path', { d: 'M19 16v6' }],
			['path', { d: 'M6 10H4a2 2 0 00-2 2v7a2 2 0 002 2h8.535' }],
			['path', { d: 'M6 21V5a2 2 0 012-2h8a2 2 0 012 2v7.126' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
