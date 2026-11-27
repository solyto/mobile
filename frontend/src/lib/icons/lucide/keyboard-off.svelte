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
		name: 'keyboard-off',
		size: 24,
		node: [
			['path', { d: 'M 20 4 A2 2 0 0 1 22 6' }],
			['path', { d: 'M 22 6 L 22 16.41' }],
			['path', { d: 'M 7 16 L 16 16' }],
			['path', { d: 'M 9.69 4 L 20 4' }],
			['path', { d: 'M14 8h.01' }],
			['path', { d: 'M18 8h.01' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2' }],
			['path', { d: 'M6 8h.01' }],
			['path', { d: 'M8 12h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
