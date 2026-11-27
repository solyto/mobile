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
		name: 'carton-off',
		size: 24,
		node: [
			['path', { d: 'M10 10H5v10a2 2 0 002 2h10a2 2 0 002-2v-1' }],
			['path', { d: 'M13 22v-9' }],
			['path', { d: 'M13.902 8.245 16 6h-4.343' }],
			['path', { d: 'M19 13.343V10a2 2 0 00-.539-1.367L16 6V3a1 1 0 00-1-1H9a1 1 0 00-.857.486' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M7.034 7.034 5.539 8.633A2 2 0 005 10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
