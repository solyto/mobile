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
		name: 'gallery-horizontal',
		size: 24,
		node: [
			['path', { d: 'M2 3v18' }],
			['rect', { width: '12', height: '18', x: '6', y: '3', rx: '2' }],
			['path', { d: 'M22 3v18' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
