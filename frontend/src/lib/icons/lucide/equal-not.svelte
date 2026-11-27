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
		name: 'equal-not',
		size: 24,
		node: [
			['line', { x1: '5', x2: '19', y1: '9', y2: '9' }],
			['line', { x1: '5', x2: '19', y1: '15', y2: '15' }],
			['line', { x1: '19', x2: '5', y1: '5', y2: '19' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
