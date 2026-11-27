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
		name: 'cloudy',
		size: 24,
		node: [
			['path', { d: 'M17.5 12a1 1 0 1 1 0 9H9.006a7 7 0 1 1 6.702-9z' }],
			['path', { d: 'M21.832 9A3 3 0 0 0 19 7h-2.207a5.5 5.5 0 0 0-10.72.61' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
