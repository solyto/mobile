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
		name: 'lock',
		size: 24,
		node: [
			['rect', { width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2' }],
			['path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
