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
		name: 'cupcake',
		size: 24,
		node: [
			['path', { d: 'M12 22v-9' }],
			['path', { d: 'M14 4h1a3 3 0 013 3l-.004.125A4 4 0 0121 11v2' }],
			['path', { d: 'm15.5 22 1.5-9' }],
			['path', { d: 'M21 13a1 1 0 01.919 1.394l-2.74 6.394A2 2 0 0117.34 22H6.659a2 2 0 01-1.838-1.212l-2.74-6.394A1 1 0 013 13z' }],
			['path', { d: 'M3 13v-2a4 4 0 013.003-3.875L6 7a3 3 0 013-3h1' }],
			['path', { d: 'M8.5 22 7 13' }],
			['circle', { cx: '12', cy: '4', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
