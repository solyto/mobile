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
		name: 'user-x',
		size: 24,
		node: [
			['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
			['circle', { cx: '9', cy: '7', r: '4' }],
			['line', { x1: '17', x2: '22', y1: '8', y2: '13' }],
			['line', { x1: '22', x2: '17', y1: '8', y2: '13' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
