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
		name: 'minimize-2',
		size: 24,
		node: [
			['path', { d: 'm14 10 7-7' }],
			['path', { d: 'M20 10h-6V4' }],
			['path', { d: 'm3 21 7-7' }],
			['path', { d: 'M4 14h6v6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
