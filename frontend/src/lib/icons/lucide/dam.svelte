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
		name: 'dam',
		size: 24,
		node: [
			['path', { d: 'M11 11.31c1.17.56 1.54 1.69 3.5 1.69 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }],
			['path', { d: 'M11.75 18c.35.5 1.45 1 2.75 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }],
			['path', { d: 'M2 10h4' }],
			['path', { d: 'M2 14h4' }],
			['path', { d: 'M2 18h4' }],
			['path', { d: 'M2 6h4' }],
			['path', { d: 'M7 3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1L10 4a1 1 0 0 0-1-1z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
