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
		name: 'cloud-check',
		size: 24,
		node: [
			['path', { d: 'm17 15-5.5 5.5L9 18' }],
			['path', { d: 'M5.516 16.07A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 3.501 7.327' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
