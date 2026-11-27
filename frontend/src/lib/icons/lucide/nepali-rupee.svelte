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
		name: 'nepali-rupee',
		size: 24,
		node: [
			['path', { d: 'M18 16.173 A4.74 4.74 0 0 0 13.496 8.005' }],
			['path', { d: 'M4 3 L20 3' }],
			['path', { d: 'M5 13 L13.5 21' }],
			['path', { d: 'M5 13 L9 13' }],
			['path', { d: 'M8 13 C15.5 13 14.667 3 8 3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
