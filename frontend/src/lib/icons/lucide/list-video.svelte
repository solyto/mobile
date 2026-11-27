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
		name: 'list-video',
		size: 24,
		node: [
			['path', { d: 'M21 5H3' }],
			['path', { d: 'M10 12H3' }],
			['path', { d: 'M10 19H3' }],
			['path', { d: 'M15 12.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
