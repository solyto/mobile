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
		name: 'notebook',
		size: 24,
		node: [
			['path', { d: 'M2 6h4' }],
			['path', { d: 'M2 10h4' }],
			['path', { d: 'M2 14h4' }],
			['path', { d: 'M2 18h4' }],
			['rect', { width: '16', height: '20', x: '4', y: '2', rx: '2' }],
			['path', { d: 'M16 2v20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
