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
		name: 'notepad-text-dashed',
		size: 24,
		node: [
			['path', { d: 'M8 2v4' }],
			['path', { d: 'M12 2v4' }],
			['path', { d: 'M16 2v4' }],
			['path', { d: 'M16 4h2a2 2 0 0 1 2 2v2' }],
			['path', { d: 'M20 12v2' }],
			['path', { d: 'M20 18v2a2 2 0 0 1-2 2h-1' }],
			['path', { d: 'M13 22h-2' }],
			['path', { d: 'M7 22H6a2 2 0 0 1-2-2v-2' }],
			['path', { d: 'M4 14v-2' }],
			['path', { d: 'M4 8V6a2 2 0 0 1 2-2h2' }],
			['path', { d: 'M8 10h6' }],
			['path', { d: 'M8 14h8' }],
			['path', { d: 'M8 18h5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
