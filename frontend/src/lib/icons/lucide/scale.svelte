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
		name: 'scale',
		size: 24,
		node: [
			['path', { d: 'M12 3v18' }],
			['path', { d: 'm19 8 3 8a5 5 0 0 1-6 0zV7' }],
			['path', { d: 'M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1' }],
			['path', { d: 'm5 8 3 8a5 5 0 0 1-6 0zV7' }],
			['path', { d: 'M7 21h10' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
