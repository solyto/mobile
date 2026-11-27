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
		name: 'align-horizontal-distribute-start',
		size: 24,
		node: [
			['rect', { width: '6', height: '14', x: '4', y: '5', rx: '2' }],
			['rect', { width: '6', height: '10', x: '14', y: '7', rx: '2' }],
			['path', { d: 'M4 2v20' }],
			['path', { d: 'M14 2v20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
