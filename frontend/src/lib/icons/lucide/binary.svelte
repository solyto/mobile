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
		name: 'binary',
		size: 24,
		node: [
			['rect', { x: '14', y: '14', width: '4', height: '6', rx: '2' }],
			['rect', { x: '6', y: '4', width: '4', height: '6', rx: '2' }],
			['path', { d: 'M6 20h4' }],
			['path', { d: 'M14 10h4' }],
			['path', { d: 'M6 14h2v6' }],
			['path', { d: 'M14 4h2v6' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
