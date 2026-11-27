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
		name: 'timeline',
		size: 24,
		node: [
			['path', { d: 'M4 12h.01' }],
			['path', { d: 'M4 16h.01' }],
			['path', { d: 'M4 20h.01' }],
			['path', { d: 'M4 4h.01' }],
			['path', { d: 'M4 8h.01' }],
			['path', { d: 'M9.414 13.414a2 2 0 0 0 1.414.586H19a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-8.172a2 2 0 0 0-1.414.586L8 12z' }],
			['path', { d: 'M9.414 21.414a2 2 0 0 0 1.414.586H19a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-8.172a2 2 0 0 0-1.414.586L8 20z' }],
			['path', { d: 'M9.414 5.414A2 2 0 0 0 10.828 6H19a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-8.172a2 2 0 0 0-1.414.586L8 4z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
