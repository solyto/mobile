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
		name: 'bed',
		size: 24,
		node: [
			['path', { d: 'M2 4v16' }],
			['path', { d: 'M2 8h18a2 2 0 0 1 2 2v10' }],
			['path', { d: 'M2 17h20' }],
			['path', { d: 'M6 8v9' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
