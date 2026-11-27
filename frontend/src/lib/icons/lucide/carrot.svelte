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
		name: 'carrot',
		size: 24,
		node: [
			['path', { d: 'M15 16a1 1 0 0 0-7-7q-4 4-5.987 12.385a.5.5 0 0 0 .602.602Q11 20 15 16l-3-3' }],
			['path', { d: 'M15 9q4 4 7 0-3-4-7 0 4-4 0-7-4 3 0 7' }],
			['path', { d: 'm8 15-2.58-2.58' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
