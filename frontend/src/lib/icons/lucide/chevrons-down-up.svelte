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
		name: 'chevrons-down-up',
		size: 24,
		node: [
			['path', { d: 'm7 20 5-5 5 5' }],
			['path', { d: 'm7 4 5 5 5-5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
