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
		name: 'torus',
		size: 24,
		node: [
			['ellipse', { cx: '12', cy: '11', rx: '3', ry: '2' }],
			['ellipse', { cx: '12', cy: '12.5', rx: '10', ry: '8.5' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
