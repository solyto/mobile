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
		name: 'hash',
		size: 24,
		node: [
			['line', { x1: '4', x2: '20', y1: '9', y2: '9' }],
			['line', { x1: '4', x2: '20', y1: '15', y2: '15' }],
			['line', { x1: '10', x2: '8', y1: '3', y2: '21' }],
			['line', { x1: '16', x2: '14', y1: '3', y2: '21' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
