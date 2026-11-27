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
		name: 'pc-case',
		size: 24,
		node: [
			['rect', { width: '14', height: '20', x: '5', y: '2', rx: '2' }],
			['path', { d: 'M15 14h.01' }],
			['path', { d: 'M9 6h6' }],
			['path', { d: 'M9 10h6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
