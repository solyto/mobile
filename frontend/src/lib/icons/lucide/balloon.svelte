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
		name: 'balloon',
		size: 24,
		node: [
			['path', { d: 'M12 16v1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v1' }],
			['path', { d: 'M12 6a2 2 0 0 1 2 2' }],
			['path', { d: 'M18 8c0 4-3.5 8-6 8s-6-4-6-8a6 6 0 0 1 12 0' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
