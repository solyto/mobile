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
		name: 'bird',
		size: 24,
		node: [
			['path', { d: 'M16 7h.01' }],
			['path', { d: 'M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20' }],
			['path', { d: 'm20 7 2 .5-2 .5' }],
			['path', { d: 'M10 18v3' }],
			['path', { d: 'M14 17.75V21' }],
			['path', { d: 'M7 18a6 6 0 0 0 3.84-10.61' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
