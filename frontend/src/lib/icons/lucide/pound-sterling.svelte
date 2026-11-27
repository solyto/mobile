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
		name: 'pound-sterling',
		size: 24,
		node: [
			['path', { d: 'M18 7c0-5.333-8-5.333-8 0' }],
			['path', { d: 'M10 7v14' }],
			['path', { d: 'M6 21h12' }],
			['path', { d: 'M6 13h10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
