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
		name: 'square-round-corner',
		size: 24,
		node: [
			['path', { d: 'M21 11a8 8 0 0 0-8-8' }],
			['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
