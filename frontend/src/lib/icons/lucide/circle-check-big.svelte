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
		name: 'circle-check-big',
		size: 24,
		node: [
			['path', { d: 'M21.801 10A10 10 0 1 1 17 3.335' }],
			['path', { d: 'm9 11 3 3L22 4' }]
		],
		aliases: ['check-circle']
	};
</script>

<Icon {...props} icon={iconData} />
