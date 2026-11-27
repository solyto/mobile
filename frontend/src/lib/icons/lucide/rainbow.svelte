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
		name: 'rainbow',
		size: 24,
		node: [
			['path', { d: 'M22 17a10 10 0 0 0-20 0' }],
			['path', { d: 'M6 17a6 6 0 0 1 12 0' }],
			['path', { d: 'M10 17a2 2 0 0 1 4 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
