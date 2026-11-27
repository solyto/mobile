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
		name: 'roller-coaster',
		size: 24,
		node: [
			['path', { d: 'M6 19V5' }],
			['path', { d: 'M10 19V6.8' }],
			['path', { d: 'M14 19v-7.8' }],
			['path', { d: 'M18 5v4' }],
			['path', { d: 'M18 19v-6' }],
			['path', { d: 'M22 19V9' }],
			['path', { d: 'M2 19V9a4 4 0 0 1 4-4c2 0 4 1.33 6 4s4 4 6 4a4 4 0 1 0-3-6.65' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
