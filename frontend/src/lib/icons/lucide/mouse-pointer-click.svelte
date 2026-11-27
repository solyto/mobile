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
		name: 'mouse-pointer-click',
		size: 24,
		node: [
			['path', { d: 'M14 4.1 12 6' }],
			['path', { d: 'm5.1 8-2.9-.8' }],
			['path', { d: 'm6 12-1.9 2' }],
			['path', { d: 'M7.2 2.2 8 5.1' }],
			['path', { d: 'M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
