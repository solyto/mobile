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
		name: 'list-sort-ascending',
		size: 24,
		node: [
			['path', { d: 'M3 19h18' }],
			['path', { d: 'M15 12H3' }],
			['path', { d: 'M9 5H3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
