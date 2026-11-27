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
		name: 'align-vertical-distribute-center',
		size: 24,
		node: [
			['path', { d: 'M22 17h-3' }],
			['path', { d: 'M22 7h-5' }],
			['path', { d: 'M5 17H2' }],
			['path', { d: 'M7 7H2' }],
			['rect', { x: '5', y: '14', width: '14', height: '6', rx: '2' }],
			['rect', { x: '7', y: '4', width: '10', height: '6', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
