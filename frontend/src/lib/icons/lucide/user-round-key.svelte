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
		name: 'user-round-key',
		size: 24,
		node: [
			['path', { d: 'M19 11v6' }],
			['path', { d: 'M19 13h2' }],
			['path', { d: 'M2 21a8 8 0 0 1 12.868-6.349' }],
			['circle', { cx: '10', cy: '8', r: '5' }],
			['circle', { cx: '19', cy: '19', r: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
