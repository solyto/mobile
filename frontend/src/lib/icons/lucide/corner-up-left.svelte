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
		name: 'corner-up-left',
		size: 24,
		node: [
			['path', { d: 'M20 20v-7a4 4 0 0 0-4-4H4' }],
			['path', { d: 'M9 14 4 9l5-5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
