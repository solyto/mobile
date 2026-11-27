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
		name: 'cake',
		size: 24,
		node: [
			['path', { d: 'M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8' }],
			['path', { d: 'M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1' }],
			['path', { d: 'M2 21h20' }],
			['path', { d: 'M7 8v3' }],
			['path', { d: 'M12 8v3' }],
			['path', { d: 'M17 8v3' }],
			['path', { d: 'M7 4h.01' }],
			['path', { d: 'M12 4h.01' }],
			['path', { d: 'M17 4h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
