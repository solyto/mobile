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
		name: 'user-round-arrow-left',
		size: 24,
		node: [
			['path', { d: 'm19 16-3 3' }],
			['path', { d: 'M2 21a8 8 0 0 1 12.664-6.5' }],
			['path', { d: 'M22 19h-6l3 3' }],
			['circle', { cx: '10', cy: '8', r: '5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
