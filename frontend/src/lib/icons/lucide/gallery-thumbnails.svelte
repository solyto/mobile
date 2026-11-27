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
		name: 'gallery-thumbnails',
		size: 24,
		node: [
			['rect', { width: '18', height: '14', x: '3', y: '3', rx: '2' }],
			['path', { d: 'M4 21h1' }],
			['path', { d: 'M9 21h1' }],
			['path', { d: 'M14 21h1' }],
			['path', { d: 'M19 21h1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
