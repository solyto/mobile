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
		name: 'alarm-clock-off',
		size: 24,
		node: [
			['path', { d: 'M6.87 6.87a8 8 0 1 0 11.26 11.26' }],
			['path', { d: 'M19.9 14.25a8 8 0 0 0-9.15-9.15' }],
			['path', { d: 'm22 6-3-3' }],
			['path', { d: 'M6.26 18.67 4 21' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M4 4 2 6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
