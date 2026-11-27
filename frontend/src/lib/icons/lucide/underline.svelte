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
		name: 'underline',
		size: 24,
		node: [
			['path', { d: 'M6 4v6a6 6 0 0 0 12 0V4' }],
			['line', { x1: '4', x2: '20', y1: '20', y2: '20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
