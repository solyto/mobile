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
		name: 'pi',
		size: 24,
		node: [
			['line', { x1: '9', x2: '9', y1: '4', y2: '20' }],
			['path', { d: 'M4 7c0-1.7 1.3-3 3-3h13' }],
			['path', { d: 'M18 20c-1.7 0-3-1.3-3-3V4' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
