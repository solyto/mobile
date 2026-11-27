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
		name: 'sun-snow',
		size: 24,
		node: [
			['path', { d: 'M10 21v-1' }],
			['path', { d: 'M10 4V3' }],
			['path', { d: 'M10 9a3 3 0 0 0 0 6' }],
			['path', { d: 'm14 20 1.25-2.5L18 18' }],
			['path', { d: 'm14 4 1.25 2.5L18 6' }],
			['path', { d: 'm17 21-3-6 1.5-3H22' }],
			['path', { d: 'm17 3-3 6 1.5 3' }],
			['path', { d: 'M2 12h1' }],
			['path', { d: 'm20 10-1.5 2 1.5 2' }],
			['path', { d: 'm3.64 18.36.7-.7' }],
			['path', { d: 'm4.34 6.34-.7-.7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
