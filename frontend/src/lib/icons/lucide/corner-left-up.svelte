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
		name: 'corner-left-up',
		size: 24,
		node: [
			['path', { d: 'M14 9 9 4 4 9' }],
			['path', { d: 'M20 20h-7a4 4 0 0 1-4-4V4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
