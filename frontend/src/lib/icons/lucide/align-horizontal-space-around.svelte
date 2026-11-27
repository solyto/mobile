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
		name: 'align-horizontal-space-around',
		size: 24,
		node: [
			['rect', { width: '6', height: '10', x: '9', y: '7', rx: '2' }],
			['path', { d: 'M4 22V2' }],
			['path', { d: 'M20 22V2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
