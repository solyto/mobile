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
		name: 'angle',
		size: 24,
		node: [
			['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16' }],
			['path', { d: 'M3 11a10 10 0 0 1 10 10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
