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
		name: 'hand-metal',
		size: 24,
		node: [
			['path', { d: 'M18 12.5V10a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4' }],
			['path', { d: 'M14 11V9a2 2 0 1 0-4 0v2' }],
			['path', { d: 'M10 10.5V5a2 2 0 1 0-4 0v9' }],
			['path', { d: 'm7 15-1.76-1.76a2 2 0 0 0-2.83 2.82l3.6 3.6C7.5 21.14 9.2 22 12 22h2a8 8 0 0 0 8-8V7a2 2 0 1 0-4 0v5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
