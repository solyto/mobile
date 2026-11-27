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
		name: 'gallery-vertical',
		size: 24,
		node: [
			['path', { d: 'M3 2h18' }],
			['rect', { width: '18', height: '12', x: '3', y: '6', rx: '2' }],
			['path', { d: 'M3 22h18' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
