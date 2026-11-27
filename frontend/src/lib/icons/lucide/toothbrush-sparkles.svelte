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
		name: 'toothbrush-sparkles',
		size: 24,
		node: [
			['path', { d: 'M10 3H8' }],
			['path', { d: 'M14.586 11.414 22 4' }],
			['path', { d: 'M15 11a8 8 0 01-.429.4' }],
			['path', { d: 'm2 22 7-7c1.857-1.857 3.714-1.99 5.571-3.6l-1.985-1.986A2 2 0 0114 6a2 2 0 012-2 2 2 0 013.262-1.552l2.152 2.138' }],
			['path', { d: 'M20 15v4' }],
			['path', { d: 'M22 17h-4' }],
			['path', { d: 'M4 5v4' }],
			['path', { d: 'M6 7H2' }],
			['path', { d: 'M9 2v2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
