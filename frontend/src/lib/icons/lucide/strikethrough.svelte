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
		name: 'strikethrough',
		size: 24,
		node: [
			['path', { d: 'M16 4H9a3 3 0 0 0-2.83 4' }],
			['path', { d: 'M14 12a4 4 0 0 1 0 8H6' }],
			['line', { x1: '4', x2: '20', y1: '12', y2: '12' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
