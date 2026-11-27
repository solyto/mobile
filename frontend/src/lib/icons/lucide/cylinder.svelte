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
		name: 'cylinder',
		size: 24,
		node: [
			['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }],
			['path', { d: 'M3 5v14a9 3 0 0 0 18 0V5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
