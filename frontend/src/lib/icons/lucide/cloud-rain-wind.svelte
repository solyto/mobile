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
		name: 'cloud-rain-wind',
		size: 24,
		node: [
			['path', { d: 'M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242' }],
			['path', { d: 'm9.2 22 3-7' }],
			['path', { d: 'm9 13-3 7' }],
			['path', { d: 'm17 13-3 7' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
