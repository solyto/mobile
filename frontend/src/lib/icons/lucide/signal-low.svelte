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
		name: 'signal-low',
		size: 24,
		node: [
			['path', { d: 'M2 20h.01' }],
			['path', { d: 'M7 20v-4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
