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
		name: 'gallery-horizontal-end',
		size: 24,
		node: [
			['path', { d: 'M2 7v10' }],
			['path', { d: 'M6 5v14' }],
			['rect', { width: '12', height: '18', x: '10', y: '3', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
