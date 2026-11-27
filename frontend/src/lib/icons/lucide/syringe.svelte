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
		name: 'syringe',
		size: 24,
		node: [
			['path', { d: 'm18 2 4 4' }],
			['path', { d: 'm17 7 3-3' }],
			['path', { d: 'M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5' }],
			['path', { d: 'm9 11 4 4' }],
			['path', { d: 'm5 19-3 3' }],
			['path', { d: 'm14 4 6 6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
