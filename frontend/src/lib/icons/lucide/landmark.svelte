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
		name: 'landmark',
		size: 24,
		node: [
			['path', { d: 'M10 18v-7' }],
			['path', { d: 'M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z' }],
			['path', { d: 'M14 18v-7' }],
			['path', { d: 'M18 18v-7' }],
			['path', { d: 'M3 22h18' }],
			['path', { d: 'M6 18v-7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
