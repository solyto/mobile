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
		name: 'heater',
		size: 24,
		node: [
			['path', { d: 'M11 8c2-3-2-3 0-6' }],
			['path', { d: 'M15.5 8c2-3-2-3 0-6' }],
			['path', { d: 'M6 10h.01' }],
			['path', { d: 'M6 14h.01' }],
			['path', { d: 'M10 16v-4' }],
			['path', { d: 'M14 16v-4' }],
			['path', { d: 'M18 16v-4' }],
			['path', { d: 'M20 6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3' }],
			['path', { d: 'M5 20v2' }],
			['path', { d: 'M19 20v2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
