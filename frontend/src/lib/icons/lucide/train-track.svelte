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
		name: 'train-track',
		size: 24,
		node: [
			['path', { d: 'M2 17 17 2' }],
			['path', { d: 'm2 14 8 8' }],
			['path', { d: 'm5 11 8 8' }],
			['path', { d: 'm8 8 8 8' }],
			['path', { d: 'm11 5 8 8' }],
			['path', { d: 'm14 2 8 8' }],
			['path', { d: 'M7 22 22 7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
