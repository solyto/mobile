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
		name: 'tornado',
		size: 24,
		node: [
			['path', { d: 'M21 4H3' }],
			['path', { d: 'M18 8H6' }],
			['path', { d: 'M19 12H9' }],
			['path', { d: 'M16 16h-6' }],
			['path', { d: 'M11 20H9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
