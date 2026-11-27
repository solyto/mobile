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
		name: 'stone',
		size: 24,
		node: [
			['path', { d: 'M11.264 2.205A4 4 0 0 0 6.42 4.211l-4 8a4 4 0 0 0 1.359 5.117l6 4a4 4 0 0 0 4.438 0l6-4a4 4 0 0 0 1.576-4.592l-2-6a4 4 0 0 0-2.53-2.53z' }],
			['path', { d: 'M11.99 22 14 12l7.822 3.184' }],
			['path', { d: 'M14 12 8.47 2.302' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
