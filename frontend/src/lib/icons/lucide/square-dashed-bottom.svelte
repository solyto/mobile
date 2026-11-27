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
		name: 'square-dashed-bottom',
		size: 24,
		node: [
			['path', { d: 'M5 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2' }],
			['path', { d: 'M9 21h1' }],
			['path', { d: 'M14 21h1' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
