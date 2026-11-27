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
		name: 'text-cursor-input',
		size: 24,
		node: [
			['path', { d: 'M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6' }],
			['path', { d: 'M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7' }],
			['path', { d: 'M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1' }],
			['path', { d: 'M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1' }],
			['path', { d: 'M9 6v12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
