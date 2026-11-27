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
		name: 'forward',
		size: 24,
		node: [
			['path', { d: 'm15 17 5-5-5-5' }],
			['path', { d: 'M4 18v-2a4 4 0 0 1 4-4h12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
