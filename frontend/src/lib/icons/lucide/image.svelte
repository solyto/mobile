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
		name: 'image',
		size: 24,
		node: [
			['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
			['circle', { cx: '9', cy: '9', r: '2' }],
			['path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
