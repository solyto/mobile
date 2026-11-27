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
		name: 'wine-off',
		size: 24,
		node: [
			['path', { d: 'M8 22h8' }],
			['path', { d: 'M7 10h3m7 0h-1.343' }],
			['path', { d: 'M12 15v7' }],
			['path', { d: 'M7.307 7.307A12.33 12.33 0 0 0 7 10a5 5 0 0 0 7.391 4.391M8.638 2.981C8.75 2.668 8.872 2.34 9 2h6c1.5 4 2 6 2 8 0 .407-.05.809-.145 1.198' }],
			['line', { x1: '2', x2: '22', y1: '2', y2: '22' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
