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
		name: 'gauge',
		size: 24,
		node: [
			['path', { d: 'm12 14 4-4' }],
			['path', { d: 'M3.34 19a10 10 0 1 1 17.32 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
