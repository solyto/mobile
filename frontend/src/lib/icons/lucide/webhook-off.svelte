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
		name: 'webhook-off',
		size: 24,
		node: [
			['path', { d: 'M17 17h-5c-1.09-.02-1.94.92-2.5 1.9A3 3 0 1 1 2.57 15' }],
			['path', { d: 'M9 3.4a4 4 0 0 1 6.52.66' }],
			['path', { d: 'm6 17 3.1-5.8a2.5 2.5 0 0 0 .057-2.05' }],
			['path', { d: 'M20.3 20.3a4 4 0 0 1-2.3.7' }],
			['path', { d: 'M18.6 13a4 4 0 0 1 3.357 3.414' }],
			['path', { d: 'm12 6 .6 1' }],
			['path', { d: 'm2 2 20 20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
