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
		name: 'pilcrow-right',
		size: 24,
		node: [
			['path', { d: 'M10 3v11' }],
			['path', { d: 'M10 9H7a1 1 0 0 1 0-6h8' }],
			['path', { d: 'M14 3v11' }],
			['path', { d: 'm18 14 4 4H2' }],
			['path', { d: 'm22 18-4 4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
