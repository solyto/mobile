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
		name: 'ticket-percent',
		size: 24,
		node: [
			['path', { d: 'M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z' }],
			['path', { d: 'M9 9h.01' }],
			['path', { d: 'm15 9-6 6' }],
			['path', { d: 'M15 15h.01' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
