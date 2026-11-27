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
		name: 'bell-off',
		size: 24,
		node: [
			['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0' }],
			['path', { d: 'M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742' }],
			['path', { d: 'm2 2 20 20' }],
			['path', { d: 'M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
