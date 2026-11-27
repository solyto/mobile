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
		name: 'triangles-centerline-dashed-horizontal',
		size: 24,
		node: [
			['path', { d: 'M10 12H8' }],
			['path', { d: 'M16 12h-2' }],
			['path', { d: 'M22 12h-2' }],
			['path', { d: 'M4 12H2' }],
			['path', { d: 'M7.298 20.288A1 1 0 008 22h8a1 1 0 00.703-1.712l-3.991-3.99a1 1 0 00-1.424-.001z' }],
			['path', { d: 'M7.298 3.712A1 1 0 018 2h8a1 1 0 01.703 1.712l-3.991 3.99a1 1 0 01-1.424.001z' }]
		],
		aliases: ['flip-horizontal-2']
	};
</script>

<Icon {...props} icon={iconData} />
