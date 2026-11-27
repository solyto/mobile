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
		name: 'ear-off',
		size: 24,
		node: [
			['path', { d: 'M6 18.5a3.5 3.5 0 1 0 7 0c0-1.57.92-2.52 2.04-3.46' }],
			['path', { d: 'M6 8.5c0-.75.13-1.47.36-2.14' }],
			['path', { d: 'M8.8 3.15A6.5 6.5 0 0 1 19 8.5c0 1.63-.44 2.81-1.09 3.76' }],
			['path', { d: 'M12.5 6A2.5 2.5 0 0 1 15 8.5M10 13a2 2 0 0 0 1.82-1.18' }],
			['line', { x1: '2', x2: '22', y1: '2', y2: '22' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
