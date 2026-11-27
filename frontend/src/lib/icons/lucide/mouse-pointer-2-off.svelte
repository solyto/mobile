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
		name: 'mouse-pointer-2-off',
		size: 24,
		node: [
			['path', { d: 'm15.55 8.45 5.138 2.087a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063L8.45 15.551' }],
			['path', { d: 'M22 2 2 22' }],
			['path', { d: 'm6.816 11.528-2.779-6.84a.495.495 0 0 1 .651-.651l6.84 2.779' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
