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
		name: 'gap-vertical',
		size: 24,
		node: [
			['path', { d: 'M2 12h2' }],
			['path', { d: 'M8 12h2' }],
			['path', { d: 'M14 12h2' }],
			['path', { d: 'M20 12h2' }],
			['path', { d: 'M3 21v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3' }],
			['path', { d: 'M3 3v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
