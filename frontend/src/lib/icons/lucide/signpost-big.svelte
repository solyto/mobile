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
		name: 'signpost-big',
		size: 24,
		node: [
			['path', { d: 'M10 9H4L2 7l2-2h6' }],
			['path', { d: 'M14 5h6l2 2-2 2h-6' }],
			['path', { d: 'M10 22V4a2 2 0 1 1 4 0v18' }],
			['path', { d: 'M8 22h8' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
