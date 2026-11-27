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
		name: 'cloud-alert',
		size: 24,
		node: [
			['path', { d: 'M12 12v4' }],
			['path', { d: 'M12 20h.01' }],
			['path', { d: 'M8.128 16.949A7 7 0 1 1 15.71 8h1.79a1 1 0 0 1 0 9h-1.642' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
