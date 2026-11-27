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
		name: 'air-vent',
		size: 24,
		node: [
			['path', { d: 'M18 17.5a2.5 2.5 0 1 1-4 2.03V12' }],
			['path', { d: 'M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' }],
			['path', { d: 'M6 8h12' }],
			['path', { d: 'M6.6 15.572A2 2 0 1 0 10 17v-5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
