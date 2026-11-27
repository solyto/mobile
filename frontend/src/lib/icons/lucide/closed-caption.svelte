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
		name: 'closed-caption',
		size: 24,
		node: [
			['path', { d: 'M10 9.17a3 3 0 1 0 0 5.66' }],
			['path', { d: 'M17 9.17a3 3 0 1 0 0 5.66' }],
			['rect', { x: '2', y: '5', width: '20', height: '14', rx: '2' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
