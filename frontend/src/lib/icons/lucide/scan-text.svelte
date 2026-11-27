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
		name: 'scan-text',
		size: 24,
		node: [
			['path', { d: 'M3 7V5a2 2 0 0 1 2-2h2' }],
			['path', { d: 'M17 3h2a2 2 0 0 1 2 2v2' }],
			['path', { d: 'M21 17v2a2 2 0 0 1-2 2h-2' }],
			['path', { d: 'M7 21H5a2 2 0 0 1-2-2v-2' }],
			['path', { d: 'M7 8h8' }],
			['path', { d: 'M7 12h10' }],
			['path', { d: 'M7 16h6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
