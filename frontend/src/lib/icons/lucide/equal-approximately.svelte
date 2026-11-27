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
		name: 'equal-approximately',
		size: 24,
		node: [
			['path', { d: 'M5 15a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0' }],
			['path', { d: 'M5 9a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
