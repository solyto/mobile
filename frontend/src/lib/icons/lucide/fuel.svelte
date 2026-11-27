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
		name: 'fuel',
		size: 24,
		node: [
			['path', { d: 'M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5' }],
			['path', { d: 'M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16' }],
			['path', { d: 'M2 21h13' }],
			['path', { d: 'M3 9h11' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
