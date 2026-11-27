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
		name: 'align-vertical-justify-end',
		size: 24,
		node: [
			['rect', { width: '14', height: '6', x: '5', y: '12', rx: '2' }],
			['rect', { width: '10', height: '6', x: '7', y: '2', rx: '2' }],
			['path', { d: 'M2 22h20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
