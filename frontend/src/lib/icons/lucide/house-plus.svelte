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
		name: 'house-plus',
		size: 24,
		node: [
			['path', { d: 'M12.35 21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v2.35' }],
			['path', { d: 'M14.8 12.4A1 1 0 0 0 14 12h-4a1 1 0 0 0-1 1v8' }],
			['path', { d: 'M15 18h6' }],
			['path', { d: 'M18 15v6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
