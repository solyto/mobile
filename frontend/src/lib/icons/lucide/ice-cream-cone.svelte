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
		name: 'ice-cream-cone',
		size: 24,
		node: [
			['path', { d: 'm7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11' }],
			['path', { d: 'M17 7A5 5 0 0 0 7 7' }],
			['path', { d: 'M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4' }]
		],
		aliases: ['ice-cream']
	};
</script>

<Icon {...props} icon={iconData} />
