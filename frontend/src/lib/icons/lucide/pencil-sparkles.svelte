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
		name: 'pencil-sparkles',
		size: 24,
		node: [
			['path', { d: 'M10 3H8' }],
			['path', { d: 'm15.007 5.008 3.987 3.986' }],
			['path', { d: 'M20 15v4' }],
			['path', { d: 'M21.174 6.813a2.82 2.82 0 0 0-3.986-3.987L3.842 16.175a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z' }],
			['path', { d: 'M22 17h-4' }],
			['path', { d: 'M4 5v4' }],
			['path', { d: 'M6 7H2' }],
			['path', { d: 'M9 2v2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
