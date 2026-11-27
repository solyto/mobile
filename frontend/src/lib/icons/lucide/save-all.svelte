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
		name: 'save-all',
		size: 24,
		node: [
			['path', { d: 'M10 2v3a1 1 0 0 0 1 1h5' }],
			['path', { d: 'M18 18v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6' }],
			['path', { d: 'M18 22H4a2 2 0 0 1-2-2V6' }],
			['path', { d: 'M8 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9.172a2 2 0 0 1 1.414.586l2.828 2.828A2 2 0 0 1 22 6.828V16a2 2 0 0 1-2.01 2z' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
