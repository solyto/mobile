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
		name: 'italic',
		size: 24,
		node: [
			['line', { x1: '19', x2: '10', y1: '4', y2: '4' }],
			['line', { x1: '14', x2: '5', y1: '20', y2: '20' }],
			['line', { x1: '15', x2: '9', y1: '4', y2: '20' }]
		]
	};
</script>

<Icon {...props} icon={iconData} />
